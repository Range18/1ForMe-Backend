import { GetTrainingRdo } from '#src/core/trainings/rdo/get-training.rdo';
import { ApiProperty } from '@nestjs/swagger';

export class GetTrainingExtraRdo {
  @ApiProperty()
  count: number;

  @ApiProperty()
  date: Date;

  @ApiProperty({ type: () => [GetTrainingRdo] })
  trainings: GetTrainingRdo[];

  constructor(count: number, date: Date, trainings: GetTrainingRdo[]) {
    this.count = count;
    this.date = date;
    this.trainings = trainings;
  }
}
