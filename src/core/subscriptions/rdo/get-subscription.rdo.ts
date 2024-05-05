import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { GetTrainingRdo } from '#src/core/trainings/rdo/get-training.rdo';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';

export class GetSubscriptionRdo {
  id: number;

  client: GetUserRdo;

  trainer: GetUserRdo;

  trainings: GetTrainingRdo[];

  transaction: GetTransactionRdo;

  finishedTrainingsCount: number;

  isFinished: boolean;

  constructor(subscription: Subscription) {
    this.id = subscription.id;
    this.trainings = subscription.trainings
      ? subscription.trainings.map((training) => new GetTrainingRdo(training))
      : undefined;
    this.transaction = subscription.transaction
      ? new GetTransactionRdo(subscription.transaction)
      : undefined;
    this.client = subscription.client
      ? new GetUserRdo(subscription.client)
      : undefined;
    this.trainer = subscription.trainer
      ? new GetUserRdo(subscription.trainer)
      : undefined;
    if (this.trainings) {
      this.finishedTrainingsCount = this.trainings.reduce(
        (previousValue, entity) =>
          previousValue +
          Number(
            new Date(entity.date).getTime() <= new Date(Date.now()).getTime(),
          ),

        0,
      );
      this.isFinished = this.finishedTrainingsCount === this.trainings.length;
    }
  }
}
