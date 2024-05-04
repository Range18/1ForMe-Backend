import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { ApiProperty } from '@nestjs/swagger';

export class GetAnalyticsRdo {
  @ApiProperty({ type: () => [GetTransactionRdo] })
  transactions: GetTransactionRdo[];

  @ApiProperty()
  day: number;

  @ApiProperty()
  month: number;

  @ApiProperty()
  totalCost: number;

  constructor(
    transactionsRdo: GetTransactionRdo[],
    totalCost: number,
    day: number,
    month: number,
  ) {
    this.transactions = transactionsRdo;
    this.totalCost = totalCost;
    this.day = day;
    this.month = month;
  }
}
