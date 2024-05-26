export enum PaymentStatus {
  New = 'NEW',
  Authorized = 'AUTHORIZED',
  Confirmed = 'CONFIRMED',
  PartialReversed = 'PARTIAL_REVERSED',
  Reversed = 'REVERSED',
  PartialRefunded = 'PARTIAL_REFUNDED',
  Refunded = 'REFUNDED',
  Canceled = 'CANCELED',
  Rejected = 'REJECTED',
}
