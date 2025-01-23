import { Module } from '@nestjs/common';
import { AuthModule } from '#src/core/auth/auth.module';
import { UserModule } from '#src/core/users/user.module';
import { ClientsService } from '#src/core/clients/clients.service';

@Module({
  imports: [AuthModule, UserModule],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientModule {}
