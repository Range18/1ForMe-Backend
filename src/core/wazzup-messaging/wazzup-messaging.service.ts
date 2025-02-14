import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { wazzupConfig } from '#src/common/configs/wazzup.config';
import {
  ChatType,
  NormalizedChatType,
} from '#src/core/chat-types/types/chat.type';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { WazzupContactRdo } from '#src/core/wazzup-messaging/rdo/wazzup-contact.rdo';
import { backendServer } from '#src/common/configs/config';
import console from 'node:console';
import { WazzupMessageDto } from '#src/core/wazzup-messaging/dto/wazzup-message.dto';
import { UserService } from '#src/core/users/user.service';
import { WazzupWebhooksDto } from '#src/core/wazzup-messaging/dto/wazzup-webhooks.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WazzupMessagingSettings } from '#src/core/wazzup-messaging/entities/wazzup-messaging-settings.entity';
import { Repository } from 'typeorm';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { chatTypes } from '#src/core/chat-types/constants/chat-types.constant';
import BootstrapExceptions = AllExceptions.BootstrapExceptions;

@Injectable()
export class WazzupMessagingService
  implements OnModuleInit, OnApplicationBootstrap
{
  private readonly httpClient = axios.create({
    ...axios.defaults,
    baseURL: 'https://api.wazzup24.com/v3',
    headers: {
      Authorization: `Bearer ${wazzupConfig.apiKey}`,
    },
  });
  private readonly messengersChannels: Record<string, string> = {};

  private wazzupMessagingSettings: WazzupMessagingSettings[];

  constructor(
    private readonly userService: UserService,
    @InjectRepository(WazzupMessagingSettings)
    private readonly messagingSettingsRepository: Repository<WazzupMessagingSettings>,
  ) {}

  onApplicationBootstrap(): void {
    this.connectWebHooks();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.getWazzupMessagingSettingsAndCacheIt();
      await this.fetchChannelsAndCacheIt();
      setInterval(async () => await this.fetchChannelsAndCacheIt(), 1800000);
      setInterval(
        async () => await this.getWazzupMessagingSettingsAndCacheIt(),
        1800000,
      );
    } catch (err) {
      Logger.error(err);
    }
  }

  private async getWazzupMessagingSettingsAndCacheIt() {
    this.wazzupMessagingSettings = await this.messagingSettingsRepository.find({
      relations: { messagingService: true },
      where: {},
    });

    if (
      !this.wazzupMessagingSettings ||
      this.wazzupMessagingSettings.length === 0
    ) {
      Logger.error(BootstrapExceptions.WazzupMessagingSettingsNotFound);
    }
  }

  async sendNotificationToOwner(message: string) {
    if (!this.wazzupMessagingSettings) return;

    for (const wazzupMessagingSetting of this.wazzupMessagingSettings) {
      if (
        wazzupMessagingSetting.messagingService.name.toLowerCase() ===
        chatTypes.telegram
      ) {
        await this.sendTelegramMessage(
          wazzupMessagingSetting.notificationPhone,
          message,
        );
      } else {
        await this.sendWhatsAppMessage(
          wazzupMessagingSetting.notificationPhone,
          message,
        );
      }
    }
  }

  async sendMessage(
    chatType: NormalizedChatType,
    userPhone: string,
    message: string,
    notificationMessage?: string,
  ): Promise<void> {
    chatType = String(chatType).toLowerCase() as NormalizedChatType;

    if (chatType === 'telegram') {
      await this.sendTelegramMessage(userPhone, message);
    } else {
      await this.sendWhatsAppMessage(userPhone, message);
    }

    if (notificationMessage)
      await this.sendNotificationToOwner(notificationMessage);
  }

  private async sendTelegramMessage(
    userPhone: string,
    message: string,
  ): Promise<void> {
    await this.httpClient
      .post('message', {
        channelId: this.messengersChannels['telegram'],
        chatType: 'telegram',
        text: message,
        phone: userPhone,
      })
      .catch((err: AxiosError) => {
        console.log(err?.response?.data);
        throw new ServiceUnavailableException(err?.response?.data);
      });
  }

  private async sendWhatsAppMessage(
    userPhone: string,
    message: string,
  ): Promise<void> {
    await this.httpClient
      .post('message', {
        channelId: this.messengersChannels['whatsapp'],
        chatType: 'whatsapp',
        text: message,
        chatId: userPhone,
      })
      .catch(async (err: AxiosError) => {
        console.log(err?.response?.data);
        throw new ServiceUnavailableException(err?.response?.data);
      });
  }

  private async fetchChannelsAndCacheIt(): Promise<void> {
    const channelsResponse = await this.httpClient
      .get<{ channelId: string; transport: ChatType; state: string }[]>(
        'channels',
      )
      .catch((error: AxiosError) => {
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

  private async connectWebHooks(): Promise<void> {
    await this.httpClient
      .patch('webhooks', {
        webhooksUri: `${backendServer.urlValue}/api/wazzup-messaging/webhooks`,
        subscriptions: {
          messagesAndStatuses: true,
          contactsAndDealsCreation: true,
          channelsUpdates: false,
          templateStatus: false,
        },
      })
      .catch((error: AxiosError) => {
        console.log(error.response.data);
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
    userId: number,
    options?: {
      responsibleUserId?: number;
      chatId?: string;
      chatType?: string;
    },
  ): Promise<void> {
    const userEntity = await this.userService.findOne({
      where: { id: userId },
      relations: { chatType: true, trainers: true },
    });
    const chatType = userEntity.chatType.name.toLowerCase();

    await this.httpClient
      .post('/contacts', [
        {
          id: userEntity.id.toString(),
          responsibleUserId: options?.responsibleUserId
            ? options.responsibleUserId.toString()
            : userEntity.trainers
            ? userEntity.trainers.at(-1)
            : '0',
          name: userEntity.surname
            ? `${userEntity.name} ${userEntity.surname}`
            : `${userEntity.name}`,
          contactData: [
            {
              chatType: chatType,
              chatId:
                chatType === 'whatsapp' ? userEntity.phone : options?.chatId,
              username:
                chatType === 'telegram'
                  ? userEntity.userNameInMessenger
                  : undefined,
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
    const response = await this.httpClient
      .get<WazzupContactRdo>(`/contacts/${id}`)
      .catch((error: AxiosError) => {
        console.log(error.response?.data);
        return error;
      });

    return response instanceof AxiosError ? null : response.data;
  }

  async resolveWebhook(webhookDto: WazzupWebhooksDto) {
    if (webhookDto.messages) {
      await this.changeChatIdOrCreateContact(webhookDto.messages);
    }
  }

  async changeChatIdOrCreateContact(messages: WazzupMessageDto[]) {
    const userPhone =
      messages[0].chatType === 'telegram'
        ? messages[0].contact.phone
        : messages[0].chatId;

    const user = userPhone
      ? await this.userService.findOne({
          where: { phone: userPhone },
          relations: { chatType: true },
        })
      : null;
    console.log(messages[0].contact);
    if (!user) {
      return;
    }
    console.log(user.id);
    await this.createContact(user.id, { chatId: messages[0].chatId });
    await this.userService.updateOne(user, {
      userNameInMessenger:
        messages[0].contact.username ?? user.userNameInMessenger,
      chatId: messages[0].chatId ?? user.chatId,
    });
  }
}
