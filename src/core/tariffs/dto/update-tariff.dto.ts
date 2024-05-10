import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTariffDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly cost?: number;

  readonly duration?: string;

  readonly sport?: number;

  //only for subs
  readonly subExpireAt?: Date;

  trainingAmount?: number;

  isForSubscription?: boolean;
}
