import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateTrainingDto } from '#src/core/trainings/dto/create-training.dto';

export class CreateSubscriptionDto {
  @ApiProperty()
  client: number;

  @ApiProperty({
    type: () => [OmitType(CreateTrainingDto, ['client'])],
  })
  createTrainingDto: Omit<CreateTrainingDto, 'createTransactionDto'>[];

  tariff: number;
}
