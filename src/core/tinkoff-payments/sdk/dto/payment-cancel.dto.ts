export class PaymentCancelDto {
  TerminalKey: string;

  PaymentId: string;

  constructor(terminalKey: string, paymentId: string) {
    this.TerminalKey = terminalKey;
    this.PaymentId = paymentId;
  }
}
