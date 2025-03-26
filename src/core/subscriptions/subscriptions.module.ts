import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { UserModule } from '#src/core/users/user.module';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { TrainingsModule } from '#src/core/trainings/trainings.module';
import { TransactionsModule } from '#src/core/transactions/transactions.module';
import { TariffsModule } from '#src/core/tariffs/tariffs.module';
import { TinkoffPaymentsModule } from '#src/core/tinkoff-payments/tinkoff-payments.module';
import { WazzupMessagingModule } from '#src/core/wazzup-messaging/wazzup-messaging.module';
import { StudioSlotsModule } from '#src/core/studio-slots/studio-slots.module';
import { SubscriptionCardsModule } from '#src/core/subscription-cards/subscription-cards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, UserEntity, Transaction]),
    UserModule,
    SessionModule,
    TokenModule,
    TrainingsModule,
    TransactionsModule,
    TariffsModule,
    TinkoffPaymentsModule,
    WazzupMessagingModule,
    StudioSlotsModule,
    SubscriptionCardsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
