import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';

export class GetAnalyticsRdo {
  transactions: GetTransactionRdo[];

  day: number;

  month: number;

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
