import { Module } from '@nestjs/common';
import { StudioSlotsService } from './studio-slots.service';
import { StudioSlotsController } from './studio-slots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '#src/core/users/user.module';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';
import { TrainingsModule } from '#src/core/trainings/trainings.module';
import { StudiosModule } from '#src/core/studios/studios.module';
import { ClubsModule } from '#src/core/clubs/clubs.module';
import { SlotsModule } from '#src/core/trainer-slots/slots.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClubSlots]),
    UserModule,
    SessionModule,
    TokenModule,
    TrainingsModule,
    StudiosModule,
    ClubsModule,
    SlotsModule,
  ],
  controllers: [StudioSlotsController],
  providers: [StudioSlotsService],
  exports: [StudioSlotsService],
})
export class StudioSlotsModule {}
