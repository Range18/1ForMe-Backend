import { Module } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { SlotsController } from './slots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from '#src/core/slots/entities/slot.entity';
import { UserModule } from '#src/core/users/user.module';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { ClubSlotsModule } from '#src/core/club-slots/club-slots.module';
import { TrainingsModule } from '#src/core/trainings/trainings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot]),
    UserModule,
    SessionModule,
    TokenModule,
    ClubSlotsModule,
    TrainingsModule,
  ],
  controllers: [SlotsController],
  providers: [SlotsService],
})
export class SlotsModule {}
