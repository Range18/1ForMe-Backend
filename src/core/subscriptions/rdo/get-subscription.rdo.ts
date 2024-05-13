import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { GetTrainingRdo } from '#src/core/trainings/rdo/get-training.rdo';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { GetTrainerRdo } from '#src/core/users/rdo/get-trainer.rdo';
import { ApiProperty, OmitType } from '@nestjs/swagger';

class GetTrainerRdoForSub {
  readonly id: number;
  readonly name: string;
  readonly phone: string;
  readonly surname: string;
  readonly birthday: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  @ApiProperty({ type: () => OmitType(GetTrainerRdo, ['studios']) })
  readonly trainerProfile: GetTrainerRdo;
}

export class GetSubscriptionRdo {
  id: number;
  @ApiProperty({
    type: () =>
      OmitType(GetUserRdo, [
        'avatar',
        'closestTraining',
        'role',
        'trainerProfile',
      ]),
  })
  client: GetUserRdo;

  trainer: GetUserRdo;

  trainings: GetTrainingRdo[];

  transaction: GetTransactionRdo;

  costForOne: number;

  nextTraining: GetTrainingRdo;

  finishedTrainingsCount: number;

  isFinished: boolean;

  constructor(subscription: Subscription, extraInfo = true) {
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
      if (extraInfo) {
        this.isFinished = this.finishedTrainingsCount === this.trainings.length;
        this.costForOne = this.transaction.cost / this.trainings.length;
        this.nextTraining = this.trainings[0];
      }
    }
  }
}
