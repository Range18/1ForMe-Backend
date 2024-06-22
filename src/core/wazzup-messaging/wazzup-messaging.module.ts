import { forwardRef, Module } from '@nestjs/common';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { WazzupMessagingController } from '#src/core/wazzup-messaging/wazzup-messaging.controller';
import { AuthModule } from '#src/core/auth/auth.module';
import { ChatTypesModule } from '#src/core/chat-types/chat-types.module';
import { UserModule } from '#src/core/users/user.module';

@Module({
  imports: [forwardRef(() => AuthModule), ChatTypesModule, UserModule],
  controllers: [WazzupMessagingController],
  providers: [WazzupMessagingService],
  exports: [WazzupMessagingService],
})
export class WazzupMessagingModule {}
