import { HttpStatus, Injectable } from '@nestjs/common';
import { BlockList } from 'node:net';
import axios from 'axios';
import { PaymentInitDto } from '#src/core/tinkoff-payments/sdk/dto/payment-init.dto';
import { tinkoffConfig } from '#src/common/configs/tinkoff.config';
import { PaymentInitRdo } from '#src/core/tinkoff-payments/sdk/rdo/payment-init.rdo';
import { ReceiptFFD105Dto } from '#src/core/tinkoff-payments/sdk/dto/receipt-ffd105.dto';
import { ItemFFD105Dto } from '#src/core/tinkoff-payments/sdk/dto/item-ffd105.dto';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import * as crypto from 'node:crypto';
import { PaymentCancelDto } from '#src/core/tinkoff-payments/sdk/dto/payment-cancel.dto';
import { PaymentCancelRdo } from '#src/core/tinkoff-payments/sdk/rdo/payment-cancel.rdo';
import { PaymentNotificationDto } from '#src/core/tinkoff-payments/dto/payment-notification.dto';
import { TransactionsService } from '#src/core/transactions/transactions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';
import { BaseEntityService } from '#src/common/base-entity.service';
import { PaymentStateRdo } from '#src/core/tinkoff-payments/sdk/rdo/payment-state.rdo';
import { PaymentStateDto } from '#src/core/tinkoff-payments/sdk/dto/payment-state.dto';
import { PaymentStatus } from '#src/core/tinkoff-payments/enums/payment-status.enum';
import { TinkoffPaymentEntity } from '#src/core/tinkoff-payments/entities/tinkoff-payment.entity';
import { CreatePaymentOptions } from '#src/core/tinkoff-payments/types/create-payment-options.interface';
import { TransactionPaidVia } from '#src/core/transactions/types/transaction-paid-via.enum';
import ms from 'ms';
import { formatDateWithGmt } from '#src/common/utilities/format-date-with-gmt.func';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionCreatedFrom } from '#src/core/subscriptions/types/subscription-created-from.enum';
import PaymentExceptions = AllExceptions.PaymentExceptions;

@Injectable()
export class TinkoffPaymentsService extends BaseEntityService<
  TinkoffPaymentEntity,
  'PaymentExceptions'
> {
  // @ts-ignore
  private readonly httpClient = axios.create({
    ...axios.defaults,
    baseURL: 'https://securepay.tinkoff.ru/v2',
  });
  private readonly ipWhitelist = new BlockList();

  constructor(
    @InjectRepository(TinkoffPaymentEntity)
    private readonly tinkoffPaymentsRepository: Repository<TinkoffPaymentEntity>,
    private readonly transactionsService: TransactionsService,
    private readonly eventEmitter2: EventEmitter2,
  ) {
    super(
      tinkoffPaymentsRepository,
      new ApiException(
        HttpStatus.NOT_FOUND,
        'PaymentExceptions',
        PaymentExceptions.PaymentNotFound,
      ),
    );

    this.ipWhitelist.addSubnet('91.194.226.0', 23, 'ipv4');
    this.ipWhitelist.addSubnet('91.218.132.0', 24, 'ipv4');
    this.ipWhitelist.addSubnet('91.218.133.0', 24, 'ipv4');
    this.ipWhitelist.addSubnet('91.218.134.0', 24, 'ipv4');
    this.ipWhitelist.addSubnet('91.218.135.0', 24, 'ipv4');
    this.ipWhitelist.addSubnet('212.233.80.0', 24, 'ipv4');
    this.ipWhitelist.addSubnet('212.233.81.0', 24, 'ipv4');
    this.ipWhitelist.addSubnet('212.233.82.0', 24, 'ipv4');
    this.ipWhitelist.addSubnet('212.233.83.0', 24, 'ipv4');

    // For test terminal
    this.ipWhitelist.addAddress('91.194.226.181', 'ipv4');
  }

  public async createPayment(
    createPaymentOptions: CreatePaymentOptions,
  ): Promise<string> {
    const paymentReceipt = new ReceiptFFD105Dto(
      [
        new ItemFFD105Dto(
          createPaymentOptions.metadata.name,
          createPaymentOptions.amount,
          createPaymentOptions.quantity,
          'none',
        ),
      ],
      createPaymentOptions.user.phone,
      'osn',
    );
    const paymentInitDto = new PaymentInitDto(
      tinkoffConfig.terminalKey,
      createPaymentOptions.amount * 100,
      createPaymentOptions.transactionId.toString(),
      createPaymentOptions.metadata.description,
      createPaymentOptions.user.id.toString(),
      'O',
      'ru',
      tinkoffConfig.notificationURL,
      undefined,
      paymentReceipt,
      formatDateWithGmt(new Date(Date.now() + ms('90d'))),
      createPaymentOptions.successURL,
    );

    const paymentInitResponse = await this.httpClient.post<PaymentInitRdo>(
      'Init',
      this.getSignedDto(paymentInitDto, tinkoffConfig.terminalPassword),
    );

    if (
      paymentInitResponse.data.Success === false ||
      !paymentInitResponse.data?.PaymentURL
    ) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PaymentExceptions',
        PaymentExceptions.FailedToCreatePayment,
      );
    }

    await this.save({
      paymentId: paymentInitResponse.data.PaymentId,
      transactionId: createPaymentOptions.transactionId,
      paymentURL: paymentInitResponse.data.PaymentURL,
    });

    return paymentInitResponse.data.PaymentURL;
  }

  async cancelOrRefundPayment(transactionId: number): Promise<void> {
    const transaction = await this.transactionsService.findOne({
      where: { id: transactionId },
    });
    const tinkoffPayment = await this.findOne({
      where: { transactionId: transactionId },
    });

    const paymentState = await this.getPaymentState(tinkoffPayment.paymentId);
    if (!paymentState.Success) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PaymentExceptions',
        PaymentExceptions.PaymentNotFound,
      );
    }

    if (
      paymentState.Status === PaymentStatus.Canceled ||
      paymentState.Status === PaymentStatus.Refunded
    ) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PaymentExceptions',
        PaymentExceptions.PaymentAlreadyCanceledOrRefunded,
      );
    }

    const paymentCancelDto = new PaymentCancelDto(
      tinkoffConfig.terminalKey,
      tinkoffPayment.paymentId,
    );

    const paymentCancelResponse = await this.httpClient.post<PaymentCancelRdo>(
      'Cancel',
      this.getSignedDto(paymentCancelDto, tinkoffConfig.terminalPassword),
    );

    if (
      paymentCancelResponse.data.Success === false ||
      (paymentCancelResponse.data.Status !== PaymentStatus.Refunded &&
        paymentCancelResponse.data.Status !== PaymentStatus.Canceled)
    ) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PaymentExceptions',
        PaymentExceptions.FailedToCancelOrRefundPayment,
      );
    }

    console.log(paymentCancelResponse.data);
    // @ts-ignore
    if (paymentCancelResponse.data.Status === PaymentStatus.Canceled) {
      await this.transactionsService.updateOne(transaction, {
        status: TransactionStatus.Canceled,
      });
      // @ts-ignore
    } else if (paymentCancelResponse.data.Status === PaymentStatus.Refunded) {
      await this.transactionsService.updateOne(transaction, {
        status: TransactionStatus.Refunded,
      });
    }
  }

  async handleNotification(
    ip: string,
    notificationDto: PaymentNotificationDto,
  ): Promise<'OK'> {
    if (!this.ipWhitelist.check(ip.replace('::ffff:', ''))) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'PaymentExceptions',
        PaymentExceptions.BadIp,
      );
    }

    const generatedFromDataToken = this.generateTokenForData(
      { ...notificationDto, Token: undefined },
      tinkoffConfig.terminalPassword,
    );

    if (generatedFromDataToken.Token !== notificationDto.Token) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'PaymentExceptions',
        PaymentExceptions.WrongToken,
      );
    }

    if (notificationDto.Status !== PaymentStatus.Confirmed) return 'OK';

    const tinkoffPayment = await this.findOne({
      where: { paymentId: notificationDto.PaymentId.toString() },
    });

    const transaction = await this.transactionsService.findOne({
      where: { id: tinkoffPayment.transactionId },
      relations: { relatedTransaction: true, subscription: true },
    });

    await this.transactionsService.updateOne(
      { where: { id: tinkoffPayment.transactionId } },
      {
        status: TransactionStatus.Paid,
        paidVia: TransactionPaidVia.OnlineService,
      },
    );

    if (transaction.relatedTransaction) {
      await this.transactionsService.updateOne(
        { where: { id: transaction.relatedTransaction.id } },
        {
          status: TransactionStatus.Paid,
          paidVia: TransactionPaidVia.OnlineService,
        },
      );
    }

    // Check if gift transaction
    if (
      !transaction.training &&
      !transaction.subscription &&
      !transaction.trainer
    ) {
      this.eventEmitter2.emit('gift.transaction.paid', transaction.id);
    }

    // Check if subscription created via card transaction
    if (
      !transaction.training &&
      !transaction.trainer &&
      transaction.subscription &&
      transaction.subscription.createdFrom === SubscriptionCreatedFrom.Card
    ) {
      this.eventEmitter2.emit(
        'subscriptionCreatedViaCard.transaction.paid',
        transaction.id,
      );
    }

    return 'OK';
  }

  async getPaymentState(paymentId: string): Promise<PaymentStateRdo> {
    const paymentStateDto = new PaymentStateDto(
      tinkoffConfig.terminalKey,
      paymentId,
    );

    return await this.httpClient
      .post<PaymentStateRdo>(
        'GetState',
        this.getSignedDto(paymentStateDto, tinkoffConfig.terminalPassword),
      )
      .then((res) => res.data);
  }

  private getSignedDto<T extends Record<string, any>>(
    dto: T,
    password: string,
  ): T & { Token: string } {
    return {
      ...dto,
      ...this.generateTokenForData(dto, password),
    };
  }

  private generateTokenForData(
    data: Record<string, any>,
    password: string,
  ): { Token: string } {
    data = { ...data, Password: password };

    const dataKeys = Object.keys(data)
      .filter(
        (key) => !(Array.isArray(data[key]) || typeof data[key] === 'object'),
      )
      .sort((a, b) => a.localeCompare(b));

    const tokenData: (string | number | boolean)[] = [];
    for (const key of dataKeys) {
      tokenData.push(data[key]);
    }

    const concatenatedKeysValues = tokenData.join('');

    const token = crypto
      .createHash('sha256')
      .update(concatenatedKeysValues)
      .digest('hex');

    return {
      Token: token,
    };
  }
}
