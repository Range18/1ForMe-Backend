import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateTrainingDto } from '#src/core/trainings/dto/create-training.dto';

export class CreateSubscriptionDto {
  @ApiProperty()
  client: number;

  @ApiProperty()
  cost: number;

  @ApiProperty({
    type: () => [
      OmitType(CreateTrainingDto, ['createTransactionDto', 'client', 'sport']),
    ],
  })
  createTrainingDto: Omit<CreateTrainingDto, 'createTransactionDto'>[];

  @ApiProperty({ nullable: true, required: false })
  expireAt?: Date;
}
