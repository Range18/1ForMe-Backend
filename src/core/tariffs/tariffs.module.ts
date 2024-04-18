import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
import { TariffsController } from '#src/core/tariffs/tariffs.controller';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tariff])],
  providers: [TariffsService],
  controllers: [TariffsController],
  exports: [TariffsService],
})
export class TariffsModule {}
