import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Period } from '#src/core/transactions/types/period.enum';

export class TransactionsSumsPerTimeUnitQuery {
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
