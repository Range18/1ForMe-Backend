import { PaymentStatus } from '#src/core//tinkoff-payments/enums/payment-status.enum';

export class PaymentCancelRdo {
  TerminalKey!: string;

  OrderId!: string;

  Success!: boolean;

  Status!: PaymentStatus;

  OriginalAmount!: number;

  NewAmount!: number;

  PaymentId!: string;

  ErrorCode!: string;

  Message?: string;

  Details?: string;

  ExternalRequestId?: string;
}
