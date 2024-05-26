import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';

export class UpdateTransactionDto {
  @ApiProperty({ type: String, enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}
