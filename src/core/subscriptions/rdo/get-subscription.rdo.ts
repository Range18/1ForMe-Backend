import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { GetTrainingRdo } from '#src/core/trainings/rdo/get-training.rdo';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { GetTrainerRdo } from '#src/core/users/rdo/get-trainer.rdo';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { GetTariffRdo } from '#src/core/tariffs/rdo/get-tariff.rdo';

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
  client: GetUserRdo & { phone: string };

  trainer: GetUserRdo;

  trainings: GetTrainingRdo[];

  transaction: GetTransactionRdo;

  expireAt: Date;

  costForOne: number;

  tariff: GetTariffRdo;

  nextTraining: GetTrainingRdo;

  finishedTrainingsCount: number;

  isFinished: boolean;

  paymentURL?: string;

  constructor(subscription: Subscription, extraInfo = true) {
    this.id = subscription.id;

    this.transaction = subscription.transaction
      ? new GetTransactionRdo(subscription.transaction)
      : undefined;

    this.client = subscription.client
      ? {
          ...new GetUserRdo(subscription.client),
          phone: subscription.client.phone,
        }
      : undefined;

    this.trainer = subscription.trainer
      ? new GetUserRdo(subscription.trainer)
      : undefined;
    this.tariff = subscription.transaction?.tariff
      ? new GetTariffRdo(subscription.transaction.tariff)
      : undefined;
    this.expireAt = subscription.expireAt;

    if (subscription.trainings && subscription.trainings.length > 0) {
      const sortedTrainings = subscription.trainings.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      this.trainings = sortedTrainings.map(
        (training) => new GetTrainingRdo(training),
      );
      if (extraInfo) {
        this.finishedTrainingsCount = this.trainings.reduce(
          (previousValue, entity) => {
            const [hours, minutes] = entity.slot.beginning.split(':');
            return (
              previousValue +
              Number(
                new Date(entity.date).getTime() +
                  (Number(hours) * 60 + Number(minutes)) * 60 * 1000 <=
                  new Date().getTime(),
              )
            );
          },
          0,
        );
        this.isFinished = this.finishedTrainingsCount === this.trainings.length;
        this.costForOne = this.transaction.cost / this.trainings.length;
        this.nextTraining = this.trainings[0];
      }
    }
  }
}
