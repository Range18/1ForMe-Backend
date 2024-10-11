import { ApiProperty } from '@nestjs/swagger';
import { CreateClientDto } from '#src/core/users/dto/create-client.dto';
import { CreateSubTrainingDto } from '#src/core/trainings/dto/create-sub-training.dto';

export class CreateSubscriptionViaClientDto {
  readonly trainerId: number;

  @ApiProperty({
    type: () => [CreateSubTrainingDto],
  })
  createTrainingDto: CreateSubTrainingDto[];

  readonly tariff: number;

  readonly createClient?: CreateClientDto;
}
