import { ApiProperty } from '@nestjs/swagger';

class CreateTrainingDtoForSub {
  readonly date: Date;
  readonly slot: number;
  readonly club: number;
}

export class CreateSubscriptionDto {
  @ApiProperty()
  client: number;

  readonly type?: number;

  @ApiProperty({
    type: () => [CreateTrainingDtoForSub],
  })
  createTrainingDto: CreateTrainingDtoForSub[];

  tariff: number;
}
