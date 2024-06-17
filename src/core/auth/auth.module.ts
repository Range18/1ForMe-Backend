import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../users/user.module';
import { SessionModule } from '../session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { RolesModule } from '#src/core/roles/roles.module';
import { AdminModule } from '@adminjs/nestjs';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/typeorm';
import { adminOptions } from '#src/core/admin-panel/admin.options';
import { VerificationModule } from '#src/core/verification-codes/verification.module';
import { CommentsModule } from '#src/core/comments/comments.module';
import { WazzupMessagingModule } from '#src/core/wazzup-messaging/wazzup-messaging.module';

@Module({
  imports: [
    AdminModule.createAdminAsync({
      useFactory: async () => {
        AdminJS.registerAdapter({
          Database,
          Resource,
        });
        return adminOptions;
      },
    }),
    VerificationModule,
    UserModule,
    SessionModule,
    TokenModule,
    RolesModule,
    CommentsModule,
    WazzupMessagingModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
