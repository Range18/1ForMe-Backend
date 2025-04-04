import { Module } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { TrainingsController } from './trainings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Training } from '#src/core/trainings/entities/training.entity';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { UserModule } from '#src/core/users/user.module';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { TransactionsModule } from '#src/core/transactions/transactions.module';
import { TariffsModule } from '#src/core/tariffs/tariffs.module';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { TinkoffPaymentsModule } from '#src/core/tinkoff-payments/tinkoff-payments.module';
import { WazzupMessagingModule } from '#src/core/wazzup-messaging/wazzup-messaging.module';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';
import { ClubsModule } from '#src/core/clubs/clubs.module';
import { ClientModule } from '#src/core/clients/clients.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GiftsModule } from '#src/core/gifts/gifts.module';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Training,
      TrainingType,
      Sport,
      Tariff,
      ClubSlots,
      Subscription,
    ]),
    EventEmitterModule.forRoot(),
    ClientModule,
    UserModule,
    SessionModule,
    TokenModule,
    TransactionsModule,
    TariffsModule,
    TinkoffPaymentsModule,
    WazzupMessagingModule,
    ClubsModule,
    GiftsModule,
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService],
  exports: [TrainingsService],
})
export class TrainingsModule {}
