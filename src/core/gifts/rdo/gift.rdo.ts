import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { Gift } from '../entities/gift.entity';
import { GiftCardRdo } from '#src/core/gift-cards/rdo/gift-card.rdo';

export class GiftRdo {
  readonly id: string;

  // @Transform(({ value }) => plainToInstance(GetUserRdo, value))
  sender: GetUserRdo;
  //
  // @Transform(({ value }) => plainToInstance(GetUserRdo, value))
  recipient: GetUserRdo;

  // @Transform(({ value }) => plainToInstance(GetTransactionRdo, value))
  transaction: GetTransactionRdo;

  promoCode: string;

  paymentUrl?: string;

  message?: string;

  sendAt?: Date;

  giftCard: GiftCardRdo;

  constructor(gift: Gift, paymentUrl?: string) {
    Object.assign(this, gift);
    this.paymentUrl = paymentUrl;
  }
}
