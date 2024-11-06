import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Period } from '#src/core/transactions/types/period.enum';

export class AnalyticsQuery {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  clientId?: number;

  @IsEnum(Period)
  @IsOptional()
  period?: Period;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  to?: string;
}
