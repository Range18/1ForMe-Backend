import { Controller, forwardRef, Inject } from '@nestjs/common';
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

  // // @IsFromWazzupGuard()
  // @Post('/webhooks')
  // async getWebhooks(
  //   @Res({ passthrough: true }) res: Response,
  //   @Body() body: WazzupWebhooksDto,
  // ) {
  //   if (body.createContact) {
  //     console.log('createClient: ', body);
  //     if (Number.isNaN(Number(body.createContact.responsibleUserId))) {
  //       throw new HttpException(
  //         'responsibleUserId is NaN',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //
  //     let phone: string;
  //     let username: string;
  //     let chatId: string;
  //
  //     for (const data of body.createContact.contactData) {
  //       if (data.username) {
  //         username = data.username;
  //       } else if (data.phone) {
  //         phone = data.phone;
  //       } else if (data.chatType === 'whatsapp' && data.chatId) {
  //         phone = data.chatId;
  //         chatId = data.chatId;
  //       } else if (data.chatType === 'telegram' && data.chatId) {
  //         if (data.chatId.length > 10) {
  //           chatId = data.chatId;
  //         } else {
  //           phone = data.chatId;
  //         }
  //       }
  //     }
  //
  //     const name =
  //       body.createContact.name.length > 0 ? body.createContact.name : username;
  //
  //     await this.authService.signUpByTrainer(
  //       {
  //         name: name,
  //         phone: phone,
  //         chatType: (
  //           await this.ChatTypesService.findOne({
  //             where: { name: body.createContact.contactData[0].chatType },
  //           })
  //         ).id,
  //         userNameInMessenger: username,
  //         role: 'client',
  //       },
  //       Number(body.createContact.responsibleUserId),
  //       chatId,
  //     );
  //   } else if (body.messages) {
  //     console.log('message: ', body.messages);
  //     console.log('contact: ', body.messages[0].contact);
  //     await this.wazzupMessagingService.changeChatIdOrCreateContact(
  //       body.messages,
  //     );
  //   } else if (body.channelsUpdates) {
  //   }
  //
  //   res.status(200);
  // }
}
