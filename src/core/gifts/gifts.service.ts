import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Gift } from './entities/gift.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { GiftRdo } from '#src/core/gifts/rdo/gift.rdo';
import { CreateGiftDto } from '#src/core/gifts/dto/create-gift.dto';
import { UserService } from '#src/core/users/user.service';
import { TransactionsService } from '#src/core/transactions/transactions.service';
import { TinkoffPaymentsService } from '#src/core/tinkoff-payments/tinkoff-payments.service';
import { TransactionPaidVia } from '#src/core/transactions/types/transaction-paid-via.enum';
import { GiftCardsService } from '../gift-cards/gift-cards.service';
import { frontendServer } from '#src/common/configs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import GiftExceptions = AllExceptions.GiftExceptions;
import PaymentExceptions = AllExceptions.PaymentExceptions;

@Injectable()
export class GiftsService extends BaseEntityService<
  Gift,
  'GiftExceptions',
  GiftRdo
> {
  constructor(
    @InjectRepository(Gift) private readonly giftsRepository: Repository<Gift>,
    private readonly usersService: UserService,
    private readonly transactionsService: TransactionsService,
    private readonly tinkoffPaymentsService: TinkoffPaymentsService,
    private readonly giftCardsService: GiftCardsService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(
      giftsRepository,
      new ApiException(
        HttpStatus.NOT_FOUND,
        'GiftExceptions',
        GiftExceptions.NotFound,
      ),
      GiftRdo,
    );
  }

  private readonly codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  private generatePromoCode(length = 6): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * this.codeChars.length);
      code += this.codeChars[randomIndex];
    }
    return code;
  }

  private async generateUniquePromoCode(length = 6): Promise<string> {
    let isUnique = false;
    let code: string;
    while (!isUnique) {
      code = this.generatePromoCode(length);
      const gift = await this.findOne(
        {
          where: { promoCode: code, isActive: true },
        },
        false,
      );
      isUnique = !gift;
    }
    return code;
  }

  async create(dto: CreateGiftDto) {
    const sender = await this.usersService.findOrCreate(dto.sender);
    const recipient = await this.usersService.findOrCreate(dto.recipient);

    await this.usersService.updateOne(recipient, {
      name: dto.recipient.name,
      chatType: { id: dto.recipient.chatType },
      userNameInMessenger: dto.recipient.userNameInMessenger,
    });

    await this.usersService.updateOne(sender, {
      name: dto.sender.name,
      chatType: { id: dto.sender.chatType },
      userNameInMessenger: dto.sender.userNameInMessenger,
    });

    const giftCard = await this.giftCardsService.findOne({
      where: { id: dto.giftCardId },
    });
    const tariff = giftCard.tariff;

    const code = await this.generateUniquePromoCode();

    const transaction = await this.transactionsService.save({
      client: { id: recipient.id },
      trainer: null,
      tariff: { id: tariff.id },
      cost: tariff.cost,
      createdDate: new Date(),
      paidVia: TransactionPaidVia.OnlineService,
    });

    const gift = await this.save({
      sender,
      recipient,
      promoCode: code,
      message: dto.message,
      transaction,
      sendAt: dto.sendAt,
      giftCard: { id: dto.giftCardId },
    });

    const paymentURL: string | null = await this.tinkoffPaymentsService
      .createPayment({
        transactionId: transaction.id,
        amount: transaction.cost,
        quantity: 1,
        user: {
          id: sender.id,
          phone: sender.phone,
        },
        metadata: {
          name: tariff.name,
          description: `Заказ №${transaction.id}`,
        },
        successURL: `${frontendServer.url}/creategift/success/${gift.id}`,
      })
      .catch(async () => {
        // await this.transactionsService.removeOne(transaction);
        return null;
      });

    if (!paymentURL) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PaymentExceptions',
        PaymentExceptions.FailedToCreatePayment,
      );
    }

    const giftRdo = this.formatToDto(gift);
    giftRdo.paymentUrl = paymentURL;

    return giftRdo;
  }

  @OnEvent('gift.transaction.paid')
  async setMessageTimeToSend(transactionId: number) {
    const gift = await this.findOne({
      where: { transaction: { id: transactionId } },
      relations: { recipient: { chatType: true } },
    });

    await this.updateOne(gift, { isActive: true });

    this.eventEmitter.emit('gift.set-message-timeout', gift);
    this.eventEmitter.emit('gift.send-message-to-owners', gift);
  }
}
