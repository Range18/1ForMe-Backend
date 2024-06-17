import {
  HttpException,
  HttpStatus,
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
import { UserEntity } from '#src/core/users/entity/user.entity';
import { WazzupContactRdo } from '#src/core/wazzup-messaging/rdo/wazzup-contact.rdo';
import console from 'node:console';

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
    chatType = String(chatType).toLowerCase() as NormalizedChatType;

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
    const channelsResponse = await this.httpClient
      .get<{ channelId: string; transport: ChatType; state: string }[]>(
        'channels',
      )
      .catch((error: AxiosError) => {
        console.log('77 строка wazzup что-то творит');
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      });

    channelsResponse.data.forEach((channel) => {
      if (channel.state !== 'active') {
        return void (this.messengersChannels[channel.transport] = undefined);
      }
      if (channel.transport === 'tgapi') channel.transport = 'telegram';

      this.messengersChannels[channel.transport] = channel.channelId;
    });
  }

  async createUser(user: UserEntity): Promise<void> {
    await this.httpClient
      .post('/users', [
        {
          id: user.id.toString(),
          name: user.surname ? user.name + ' ' + user.surname : user.name,
          phone: user.phone,
        },
      ])
      .catch((err: AxiosError) => {
        throw new ServiceUnavailableException(err?.response?.data);
      });
  }

  async createContact(
    responsibleUserId: number,
    userEntity: UserEntity,
  ): Promise<void> {
    const chatType = userEntity.chatType.name.toLowerCase();

    await this.httpClient
      .post('/contacts', [
        {
          id: userEntity.id.toString(),
          responsibleUserId: responsibleUserId.toString(),
          name:
            userEntity.surname.length !== 0
              ? `${userEntity.name} ${userEntity.surname}`
              : `${userEntity.name}`,
          contactData: [
            {
              chatType: chatType,
              chatId: userEntity.phone,
              username: userEntity.userNameInMessenger,
              phone: chatType === 'telegram' ? userEntity.phone : undefined,
            },
          ],
        },
      ])
      .catch((err: AxiosError) => {
        throw new ServiceUnavailableException(err?.response?.data);
      });
  }

  async getContact(id: number | string): Promise<WazzupContactRdo> {
    const response = await this.httpClient.get<WazzupContactRdo>(
      `/contacts/${id}`,
    );

    return response.data;
  }
}
