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

  costForOne: number;

  nextTraining: GetTrainingRdo;

  finishedTrainingsCount: number;

  isFinished: boolean;

  constructor(subscription: Subscription) {
    this.id = subscription.id;

    this.transaction = subscription.transaction
      ? new GetTransactionRdo(subscription.transaction)
      : undefined;

    this.client = subscription.client
      ? new GetUserRdo(subscription.client)
      : undefined;

    this.trainer = subscription.trainer
      ? new GetUserRdo(subscription.trainer)
      : undefined;

    if (subscription.trainings && subscription.trainings.length > 0) {
      const sortedTrainings = subscription.trainings.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      this.trainings = sortedTrainings.map(
        (training) => new GetTrainingRdo(training),
      );
      this.finishedTrainingsCount = this.trainings.reduce(
        (previousValue, entity) =>
          previousValue +
          Number(
            new Date(entity.date).getTime() <= new Date(Date.now()).getTime(),
          ),

        0,
      );
      this.isFinished = this.finishedTrainingsCount === this.trainings.length;
      this.costForOne = this.transaction.cost / this.trainings.length;
      this.nextTraining = this.trainings[0];
    }
  }
}
