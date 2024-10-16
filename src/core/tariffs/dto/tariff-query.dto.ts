import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class TariffQueryDto {
  @IsBoolean()
  @Transform(({ value }) => Boolean(Number.parseInt(value)))
  @IsOptional()
  isForSubscription?: boolean;
}
