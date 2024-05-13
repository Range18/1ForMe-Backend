import { ApiProperty } from '@nestjs/swagger';

export class CreateTariffDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly cost: number;

  @ApiProperty()
  readonly duration: string;

  readonly sport: number;

  readonly category: number;

  //only for subs
  readonly subExpireAt?: number;

  trainingAmount?: number;

  isForSubscription?: boolean;
}
