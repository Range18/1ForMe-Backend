import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

class CreateTrainingDtoForSub {
  @IsNotEmpty()
  readonly date: Date;

  @IsNumber()
  @IsNotEmpty()
  readonly slot: number;

  @IsNumber()
  @IsNotEmpty()
  readonly club: number;
}

export class CreateSubscriptionDto {
  @ApiProperty()
  client: number;

  @ApiProperty({
    type: () => [CreateTrainingDtoForSub],
  })
  createTrainingDto: CreateTrainingDtoForSub[];

  tariff: number;
}
