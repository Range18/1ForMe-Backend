import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../users/user.module';
import { SessionModule } from '../session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { RolesModule } from '#src/core/roles/roles.module';

@Module({
  imports: [
    // AdminModule.createAdminAsync({
    //   useFactory: async () => {
    //     AdminJS.registerAdapter({
    //       Database,
    //       Resource,
    //     });
    //     return adminOptions;
    //   },
    // }),
    UserModule,
    SessionModule,
    TokenModule,
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
