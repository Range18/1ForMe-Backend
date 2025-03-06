import { TransactionPaidVia } from '#src/core/transactions/types/transaction-paid-via.enum';

export interface ICreateTraining {
  slot: number;
  date: Date;
  client?: number[];
  club: number;
  tariff: number;
  isRepeated?: boolean;
  payVia?: TransactionPaidVia;
  promoCode?: string;
  isPaymentForTwo?: boolean;
}
