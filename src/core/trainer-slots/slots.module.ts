import { Module } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { SlotsController } from './slots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from '#src/core/trainer-slots/entities/slot.entity';
import { UserModule } from '#src/core/users/user.module';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { TrainingsModule } from '#src/core/trainings/trainings.module';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot, ClubSlots]),
    UserModule,
    SessionModule,
    TokenModule,
    TrainingsModule,
  ],
  controllers: [SlotsController],
  providers: [SlotsService],
  exports: [SlotsService],
})
export class SlotsModule {}
