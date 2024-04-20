import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserService } from './user.service';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { SessionEntity } from '#src/core/session/session.entity';
import { UserController } from '#src/core/users/user.controller';
import { SessionService } from '#src/core/session/session.service';
import { TokenService } from '#src/core/token/token.service';
import { JwtService } from '@nestjs/jwt';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { AssetEntity } from '#src/core/assets/entities/asset.entity';
import { RolesModule } from '#src/core/roles/roles.module';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RolesEntity,
      SessionEntity,
      Studio,
      AssetEntity,
      Tariff,
    ]),
    RolesModule,
  ],
  providers: [SessionService, TokenService, JwtService, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
