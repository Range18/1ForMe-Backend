import {
  Body,
  Controller,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { WazzupWebhooksDto } from '#src/core/wazzup-messaging/dto/wazzup-webhooks.dto';
import { type Response } from 'express';
import { AuthService } from '#src/core/auth/auth.service';
import { ChatTypesService } from '#src/core/chat-types/chat-types.service';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';

@Controller('api/wazzup-messaging')
export class WazzupMessagingController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly ChatTypesService: ChatTypesService,
    private readonly wazzupMessagingService: WazzupMessagingService,
  ) {}

  // @IsFromWazzupGuard()
  @Post('/webhooks')
  async getWebhooks(
    @Res({ passthrough: true }) res: Response,
    @Body() body: WazzupWebhooksDto,
  ) {
    console.log(body.messages ? body.messages[0].contact : body);
    console.log(body);

    if (body.createContact) {
      if (Number.isNaN(Number(body.createContact.responsibleUserId))) {
        throw new HttpException(
          'responsibleUserId is NaN',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.authService.signUpByTrainer(
        {
          name: body.createContact.name,
          phone:
            body.createContact.contactData[0].chatType === 'telegram'
              ? body.createContact.contactData[0].phone
              : body.createContact.contactData[0].chatId,
          chatType: (
            await this.ChatTypesService.findOne({
              where: { name: body.createContact.contactData[0].chatType },
            })
          ).id,
          userNameInMessenger: body.createContact.contactData[0].username,
          role: 'client',
        },
        Number(body.createContact.responsibleUserId),
        body.createContact.contactData[0].chatId,
      );
    } else if (body.messages) {
      await this.wazzupMessagingService.changeChatIdOrCreateContact(
        body.messages,
      );
    } else if (body.channelsUpdates) {
    }

    res.status(200);

    return;
  }
}
