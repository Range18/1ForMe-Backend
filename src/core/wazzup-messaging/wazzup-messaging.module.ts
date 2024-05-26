import { Module } from '@nestjs/common';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';

@Module({
  providers: [WazzupMessagingService],
  exports: [WazzupMessagingService],
})
export class WazzupMessagingModule {}
