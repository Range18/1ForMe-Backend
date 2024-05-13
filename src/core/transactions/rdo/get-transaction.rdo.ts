import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { GetTariffRdo } from '#src/core/tariffs/rdo/get-tariff.rdo';
import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { TransactionStatus } from '#src/core/transactions/transaction-status.type';
import { GetTrainingRdo } from '#src/core/trainings/rdo/get-training.rdo';
import { GetSubscriptionRdo } from '#src/core/subscriptions/rdo/get-subscription.rdo';

export class GetTransactionRdo {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => GetUserRdo })
  client: GetUserRdo;

  @ApiProperty({ type: () => GetUserRdo })
  trainer: GetUserRdo;

  @ApiProperty()
  status: string;

  @ApiProperty()
  cost: number;

  @ApiProperty({ nullable: true, type: () => GetTariffRdo })
  tariff?: GetTariffRdo;

  @ApiProperty({ nullable: true, type: () => GetTrainingRdo })
  training?: GetTrainingRdo;

  subscription?: GetSubscriptionRdo;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(transaction: Transaction) {
    this.id = transaction.id;

    this.client = transaction.client
      ? new GetUserRdo(transaction.client)
      : undefined;
    this.trainer = transaction.trainer
      ? new GetUserRdo(transaction.trainer)
      : undefined;

    this.training = transaction.training
      ? new GetTrainingRdo(transaction.training)
      : undefined;
    this.tariff = transaction.tariff
      ? new GetTariffRdo(transaction.tariff)
      : undefined;

    this.subscription = transaction.subscription
      ? new GetSubscriptionRdo(transaction.subscription, false)
      : undefined;

    this.cost = transaction.cost;
    this.status = TransactionStatus[transaction.status];

    this.createdAt = transaction.createdAt;
    this.updatedAt = transaction.updatedAt;
  }
}
