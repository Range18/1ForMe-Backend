import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateTrainingDto } from '#src/core/trainings/dto/create-training.dto';

export class CreateSubscriptionDto {
  @ApiProperty()
  client: number;

  readonly type?: number;

  @ApiProperty({
    type: () => [OmitType(CreateTrainingDto, ['client', 'type', 'tariff'])],
  })
  createTrainingDto: Omit<CreateTrainingDto, 'client' | 'type' | 'tariff'>[];

  tariff: number;
}
