import { Module } from '@nestjs/common';
import { UserModule } from '#src/core/users/user.module';
import { ClientsService } from '#src/core/clients/clients.service';

@Module({
  imports: [UserModule],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientModule {}
