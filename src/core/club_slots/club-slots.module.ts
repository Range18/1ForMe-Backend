import { Module } from '@nestjs/common';
import { ClubSlotsService } from './club-slots.service';
import { ClubSlotsController } from './club-slots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '#src/core/users/user.module';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { ClubSlots } from '#src/core/club_slots/entities/club-slot.entity';
import { TrainingsModule } from '#src/core/trainings/trainings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClubSlots]),
    UserModule,
    SessionModule,
    TokenModule,
    TrainingsModule,
  ],
  controllers: [ClubSlotsController],
  providers: [ClubSlotsService],
  exports: [ClubSlotsService],
})
export class ClubSlotsModule {}
