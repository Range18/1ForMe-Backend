import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportsService } from '#src/core/sports/sports.service';
import { SportsController } from '#src/core/sports/sports.controller';
import { Sport } from '#src/core/sports/entity/sports.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sport])],
  providers: [SportsService],
  controllers: [SportsController],
  exports: [SportsService],
})
export class SportsModule {}
