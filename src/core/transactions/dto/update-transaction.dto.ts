import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';
import { TransactionPaidVia } from '#src/core/transactions/types/transaction-paid-via.enum';

export class UpdateTransactionDto {
  @ApiProperty({ type: String, enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty({ type: String, enum: TransactionPaidVia })
  paidVia?: TransactionPaidVia;
}
