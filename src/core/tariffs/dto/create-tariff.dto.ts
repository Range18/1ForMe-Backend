import { ApiProperty } from '@nestjs/swagger';

export class CreateTariffDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly cost: number;

  @ApiProperty()
  readonly duration: string;

  readonly sport: number;

  //only for subs
  readonly subExpireAt?: Date;

  trainingAmount?: number;

  isForSubscription?: boolean;
}
