import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
import { TariffsController } from '#src/core/tariffs/tariffs.controller';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { UserModule } from '#src/core/users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tariff]),
    SessionModule,
    TokenModule,
    UserModule,
  ],
  providers: [TariffsService],
  controllers: [TariffsController],
  exports: [TariffsService],
})
export class TariffsModule {}
