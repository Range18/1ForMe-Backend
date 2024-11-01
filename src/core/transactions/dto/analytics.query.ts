import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsQuery {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  clientId?: number;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  to?: string;
}
