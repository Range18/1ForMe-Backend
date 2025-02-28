export interface CreatePaymentOptions {
  transactionId: number;
  amount: number;
  quantity: number;
  user: {
    id: number;
    phone: string;
  };
  metadata: {
    name: string;
    description: string;
  };
  successURL?: string;
}
