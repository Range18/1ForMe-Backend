import { ApiProperty } from '@nestjs/swagger';
import { CreateSubTrainingDto } from '#src/core/trainings/dto/create-sub-training.dto';

export class CreateSubscriptionDto {
  @ApiProperty()
  client: number;

  @ApiProperty({
    type: () => [CreateSubTrainingDto],
  })
  createTrainingDto: CreateSubTrainingDto[];

  tariff: number;
}
