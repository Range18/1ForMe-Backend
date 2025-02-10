import {
  Body,
  Controller,
  forwardRef,
  HttpCode,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from '#src/core/auth/auth.service';
import { ChatTypesService } from '#src/core/chat-types/chat-types.service';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { WazzupWebhooksDto } from '#src/core/wazzup-messaging/dto/wazzup-webhooks.dto';
import { type Response } from 'express';
import console from 'node:console';

@Controller('api/wazzup-messaging')
export class WazzupMessagingController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly ChatTypesService: ChatTypesService,
    private readonly wazzupMessagingService: WazzupMessagingService,
  ) {}

  @HttpCode(200)
  @Post('/webhooks')
  async getWebhooks(
    @Res({ passthrough: true }) res: Response,
    @Body() body: WazzupWebhooksDto,
  ) {
    console.log(body);
  }
}
