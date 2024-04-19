import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';
import { ClubsService } from '#src/core/clubs/clubs.service';
import { ClubsController } from '#src/core/clubs/clubs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Clubs])],
  providers: [ClubsService],
  controllers: [ClubsController],
  exports: [ClubsService],
})
export class ClubsModule {}
