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

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, UserEntity, Transaction]),
    UserModule,
    SessionModule,
    TokenModule,
    TrainingsModule,
    TransactionsModule,
    TariffsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
