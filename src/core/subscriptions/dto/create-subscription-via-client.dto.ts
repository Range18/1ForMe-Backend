import { ApiProperty } from '@nestjs/swagger';
import { CreateClientDto } from '#src/core/users/dto/create-client.dto';

class CreateTrainingDtoForSub {
  readonly date: Date;
  readonly slot: number;
  readonly club: number;
}

export class CreateSubscriptionViaClientDto {
  readonly trainerId: number;

  @ApiProperty({
    type: () => [CreateTrainingDtoForSub],
  })
  createTrainingDto: CreateTrainingDtoForSub[];

  readonly tariff: number;

  readonly createClient?: CreateClientDto;
}
