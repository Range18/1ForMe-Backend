import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { ApiProperty } from '@nestjs/swagger';

export class GetAnalyticsRdo {
  @ApiProperty({ type: () => [GetTransactionRdo] })
  transactions: GetTransactionRdo[];

  @ApiProperty()
  totalCost: number;

  constructor(transactionsRdo: GetTransactionRdo[], totalCost: number) {
    this.transactions = transactionsRdo;
    this.totalCost = totalCost;
  }
}
