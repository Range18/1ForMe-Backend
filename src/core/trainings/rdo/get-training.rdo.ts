import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { ApiProperty } from '@nestjs/swagger';
import { Training } from '#src/core/trainings/entities/training.entity';
import { GetClubRdo } from '#src/core/clubs/rdo/get-club.rdo';
import { TrainingStatusType } from '#src/core/trainings/training-status.type';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { GetSubscriptionRdo } from '#src/core/subscriptions/rdo/get-subscription.rdo';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';
import { parseHoursMinutes } from '#src/common/utilities/parse-hours-minutes.func';

export class GetTrainingRdo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  slot?: ClubSlots;

  @ApiProperty()
  date: Date;

  @ApiProperty({ type: () => GetUserRdo })
  client: GetUserRdo;

  @ApiProperty({ type: () => GetUserRdo })
  trainer: GetUserRdo;

  @ApiProperty({ type: () => GetClubRdo })
  club?: GetClubRdo;

  @ApiProperty({ type: () => GetTransactionRdo })
  transaction?: GetTransactionRdo;

  subscription?: GetSubscriptionRdo;

  isRepeated: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(training: Training) {
    this.id = training.id;
    this.client = training.client ? new GetUserRdo(training.client) : undefined;
    this.trainer = training.trainer
      ? new GetUserRdo(training.trainer)
      : undefined;
    this.date = training.date;
    this.slot = training.slot ?? undefined;
    this.club = training.club ? new GetClubRdo(training.club) : undefined;
    this.transaction = training.transaction
      ? new GetTransactionRdo(training.transaction)
      : undefined;
    this.subscription = training.subscription
      ? new GetSubscriptionRdo(training.subscription)
      : undefined;
    this.isRepeated = training.isRepeated;

    const [stHours, stMinutes] = parseHoursMinutes(training.slot.beginning);
    const [endHours, endMinutes] = parseHoursMinutes(training.slot.end);

    const timeStart = new Date(training.date);
    timeStart.setHours(stHours);
    timeStart.setMinutes(stMinutes);

    const timeEnd = new Date(training.date);
    timeEnd.setHours(endHours);
    timeEnd.setMinutes(endMinutes);

    if (Date.now() < timeStart.getTime()) {
      this.status = TrainingStatusType.NotFinished;
    } else if (
      Date.now() > timeStart.getTime() &&
      Date.now() < timeEnd.getTime()
    ) {
      this.status = TrainingStatusType.Running;
    } else if (Date.now() > timeEnd.getTime()) {
      this.status = TrainingStatusType.Finished;
    } else if (training.isCanceled) {
      this.status = TrainingStatusType.Canceled;
    }
    this.createdAt = training.createdAt;
    this.updatedAt = training.updatedAt;
  }
}
