import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from '#src/core/notifications/entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WazzupMessagingModule } from '#src/core/wazzup-messaging/wazzup-messaging.module';
import { TrainingsModule } from '#src/core/trainings/trainings.module';
import { SubscriptionsModule } from '#src/core/subscriptions/subscriptions.module';
import { NotifyClosestTrainingService } from '#src/core/notifications/notify-closest-training.service';
import { TinkoffPaymentsModule } from '#src/core/tinkoff-payments/tinkoff-payments.module';
import { TransactionsModule } from '#src/core/transactions/transactions.module';
import { UserModule } from '#src/core/users/user.module';

// import { NotifyDisloyalClientsService } from '#src/core/notifications/notify-disloyal-clients.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    WazzupMessagingModule,
    TrainingsModule,
    SubscriptionsModule,
    TinkoffPaymentsModule,
    TransactionsModule,
    UserModule,
  ],
  providers: [
    NotificationsService,
    NotifyClosestTrainingService,
    // NotifyDisloyalClientsService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
