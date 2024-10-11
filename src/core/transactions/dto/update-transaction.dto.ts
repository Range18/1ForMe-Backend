import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';

export class UpdateTransactionDto {
  @ApiProperty({ type: String, enum: TransactionStatus })
  status: TransactionStatus;
}
