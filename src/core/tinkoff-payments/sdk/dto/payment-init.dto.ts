import type { ReceiptFFD105Dto } from './receipt-ffd105.dto';

export type PayType = 'O' | 'T';
export type Language = 'ru' | 'en';

export class PaymentInitDto {
  TerminalKey!: string;

  Amount!: number;

  OrderId!: string;

  Description?: string;

  CustomerKey?: string;

  PayType?: PayType;

  Language?: Language;

  NotificationURL?: string;

  DATA?: Record<string, string>;

  Receipt?: ReceiptFFD105Dto;

  RedirectDueDate?: Date;

  constructor(
    terminalKey: string,
    amount: number,
    orderId: string,
    description?: string,
    customerKey?: string,
    payType?: PayType,
    language?: Language,
    notificationURL?: string,
    data?: Record<string, string>,
    receipt?: ReceiptFFD105Dto,
  ) {
    this.TerminalKey = terminalKey;
    this.Amount = amount;
    this.OrderId = orderId;
    this.Description = description;
    this.CustomerKey = customerKey;
    this.PayType = payType;
    this.Language = language;
    this.NotificationURL = notificationURL;
    this.DATA = data;
    this.Receipt = receipt;
  }
}
