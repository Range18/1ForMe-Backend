import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class TariffQueryDto {
  @IsOptional()
  clubId?: number;

  @Transform(({ value }) => value == 'true')
  @IsOptional()
  isForSubscription?: boolean;

  @Transform(({ value }) => value == 'true')
  @IsOptional()
  isPublic?: boolean;
}
