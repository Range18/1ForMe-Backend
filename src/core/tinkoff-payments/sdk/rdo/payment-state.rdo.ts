import { PaymentStatus } from '#src/core/tinkoff-payments/enums/payment-status.enum';

export class PaymentStateRdo {
  TerminalKey!: string;

  Amount!: number;

  OrderId!: string;

  Success!: boolean;

  Status!: PaymentStatus;

  PaymentId!: string;

  ErrorCode!: string;

  Message?: string;

  Details?: string;
}
