import {
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { wazzupConfig } from '#src/common/configs/wazzup.config';
import {
  ChatType,
  NormalizedChatType,
} from '#src/core/wazzup-messaging/types/chat.type';

@Injectable()
export class WazzupMessagingService implements OnModuleInit {
  private readonly httpClient = axios.create({
    ...axios.defaults,
    baseURL: 'https://api.wazzup24.com/v3',
    headers: {
      Authorization: `Bearer ${wazzupConfig.apiKey}`,
    },
  });
  private readonly messengersChannels: Record<string, string> = {};

  async onModuleInit(): Promise<void> {
    await this.fetchChannelsAndCacheIt();
    setInterval(async () => await this.fetchChannelsAndCacheIt(), 1800000);
  }

  async sendMessage(
    chatType: NormalizedChatType,
    userPhone: string,
    message: string,
  ): Promise<void> {
    chatType = chatType.toLowerCase() as NormalizedChatType;

    if (chatType === 'telegram') {
      await this.sendTelegramMessage(userPhone, message);
    } else {
      await this.sendWhatsAppMessage(userPhone, message);
    }
  }

  async sendTelegramMessage(userPhone: string, message: string): Promise<void> {
    await this.httpClient
      .post('message', {
        channelId: this.messengersChannels['telegram'],
        chatType: 'telegram',
        text: message,
        phone: userPhone,
      })
      .catch((err: AxiosError) => {
        throw new ServiceUnavailableException(err?.response?.data);
      });
  }

  async sendWhatsAppMessage(userPhone: string, message: string): Promise<void> {
    await this.httpClient
      .post('message', {
        channelId: this.messengersChannels['whatsapp'],
        chatType: 'whatsapp',
        text: message,
        chatId: userPhone,
      })
      .catch(async (err: AxiosError) => {
        throw new ServiceUnavailableException(err?.response?.data);
      });
  }

  private async fetchChannelsAndCacheIt(): Promise<void> {
    const channelsResponse = await this.httpClient.get<
      { channelId: string; transport: ChatType; state: string }[]
    >('channels');

    channelsResponse.data.forEach((channel) => {
      if (channel.state !== 'active') {
        return void (this.messengersChannels[channel.transport] = undefined);
      }
      if (channel.transport === 'tgapi') channel.transport = 'telegram';

      this.messengersChannels[channel.transport] = channel.channelId;
    });
  }
}
