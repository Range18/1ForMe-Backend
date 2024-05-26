export type PaymentMethod =
  | 'full_prepayment'
  | 'prepayment'
  | 'advance'
  | 'full_payment'
  | 'partial_payment'
  | 'credit'
  | 'credit_payment';
export type PaymentObject =
  | 'commodity'
  | 'excise'
  | 'job'
  | 'service'
  | 'gambling_bet'
  | 'gambling_prize'
  | 'lottery'
  | 'lottery_prize'
  | 'intellectual_activity'
  | 'payment'
  | 'agent_commission'
  | 'composite'
  | 'another';
export type Tax = 'none' | 'vat0' | 'vat10' | 'vat20' | 'vat110' | 'vat120';

export class ItemFFD105Dto {
  Name!: string;

  Price!: number;

  Quantity!: number;

  Amount!: number;

  PaymentMethod?: PaymentMethod;

  PaymentObject?: PaymentObject;

  Tax!: Tax;

  constructor(
    name: string,
    price: number,
    quantity: number,
    tax: Tax,
    paymentMethod?: PaymentMethod,
    paymentObject?: PaymentObject,
  ) {
    this.Name = name;
    this.Price = price * 100;
    this.Quantity = quantity;
    this.Amount = quantity * price;
    this.PaymentMethod = paymentMethod;
    this.PaymentObject = paymentObject;
    this.Tax = tax;
  }
}
