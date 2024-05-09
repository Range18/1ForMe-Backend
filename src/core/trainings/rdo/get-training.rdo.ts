import { Sport } from '#src/core/sports/entity/sports.entity';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Training } from '#src/core/trainings/entities/training.entity';
import { GetClubRdo } from '#src/core/clubs/rdo/get-club.rdo';
import { parseHoursMinutes } from '#src/common/utilities/parse-hours-minutes';
import { TrainingStatusType } from '#src/core/trainings/training-status.type';

export class GetTrainingRdo {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: Sport })
  sport?: Sport;

  @ApiProperty()
  status: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  duration: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  date: Date;

  @ApiProperty({ type: () => GetUserRdo })
  client: GetUserRdo;

  @ApiProperty({ type: () => GetUserRdo })
  trainer: GetUserRdo;

  @ApiProperty({ type: TrainingType })
  type?: TrainingType;

  @ApiProperty({ type: () => GetClubRdo })
  club?: GetClubRdo;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(training: Training) {
    this.id = training.id;
    this.sport = training?.sport;
    this.client = training.client ? new GetUserRdo(training.client) : undefined;
    this.trainer = training.trainer
      ? new GetUserRdo(training.trainer)
      : undefined;
    this.date = training.date;
    this.startTime = training.startTime;
    this.endTime = training.endTime;
    this.duration = training.duration;
    this.type = training?.type;
    this.club = training.club ? new GetClubRdo(training.club) : undefined;

    const [stHours, stMinutes] = parseHoursMinutes(training.startTime);
    const [endHours, endMinutes] = parseHoursMinutes(training.endTime);

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
