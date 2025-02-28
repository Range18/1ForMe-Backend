import { IsNumber, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TariffQueryDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  clubId?: number;

  @Transform(({ value }) => value == 'true')
  @IsOptional()
  isForSubscription?: boolean;

  @Transform(({ value }) => value == 'true')
  @IsOptional()
  isPublic?: boolean;
}
