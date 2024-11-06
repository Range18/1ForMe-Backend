import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Period } from '#src/core/transactions/types/period.enum';

export class TransactionQuery {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  clientId?: number;

  @IsDate()
  @IsOptional()
  from?: Date;

  @IsEnum(Period)
  @IsOptional()
  period?: Period;

  @IsDate()
  @IsOptional()
  to: Date = new Date();
}
