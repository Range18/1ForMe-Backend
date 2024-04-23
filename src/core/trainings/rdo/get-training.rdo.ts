import { Sport } from '#src/core/sports/entity/sports.entity';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Training } from '#src/core/trainings/entities/training.entity';

export class GetTrainingRdo {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: Sport })
  sport: Sport;

  @ApiProperty()
  isFinished: boolean;

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
  type: TrainingType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(training: Training) {
    this.id = training.id;
    this.sport = training.sport;
    this.client = training.client ? new GetUserRdo(training.client) : undefined;
    this.trainer = training.trainer
      ? new GetUserRdo(training.trainer)
      : undefined;
    this.date = training.date;
    this.startTime = training.startTime;
    this.endTime = training.endTime;
    this.duration = training.duration;
    this.type = training.type;

    this.createdAt = training.createdAt;
    this.updatedAt = training.updatedAt;
  }
}
