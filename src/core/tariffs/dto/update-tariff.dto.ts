import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTariffDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @IsOptional()
  readonly cost?: number;

  readonly duration?: string;

  readonly sport?: number;

  category: number;

  //Only for groups, pairs

  clientsAmount?: number;

  //only for subs
  readonly subExpireAt?: number;

  trainingAmount?: number;

  isForSubscription?: boolean;
}
