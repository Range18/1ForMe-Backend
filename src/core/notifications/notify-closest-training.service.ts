import { Injectable, Logger } from '@nestjs/common';
import { TrainingsService } from '#src/core/trainings/trainings.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import console from 'node:console';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';
import { messageTemplates } from '#src/core/wazzup-messaging/templates/message-templates';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { TinkoffPaymentsService } from '#src/core/tinkoff-payments/tinkoff-payments.service';
import { Training } from '#src/core/trainings/entities/training.entity';
import { PaymentStatus } from '#src/core/tinkoff-payments/enums/payment-status.enum';
import { TransactionsService } from '#src/core/transactions/transactions.service';
import { chatTypes } from '#src/core/chat-types/constants/chat-types.constant';
import { TransactionPaidVia } from '#src/core/transactions/types/transaction-paid-via.enum';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { dateToRecordString } from '#src/common/utilities/format-utc-date.func';
import { NormalizedChatType } from '#src/core/chat-types/types/chat.type';
import { notificationMessageTemplates } from '#src/core/wazzup-messaging/templates/notification-message-templates';
import { ISODateToString } from '#src/common/utilities/iso-date-to-string.func';
import PaymentExceptions = AllExceptions.PaymentExceptions;

@Injectable()
export class NotifyClosestTrainingService {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly wazzupMessagingService: WazzupMessagingService,
    private readonly tinkoffPaymentsService: TinkoffPaymentsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    name: 'notificationsAboutCloseTraining',
  })
  async notifyAboutCloseTraining() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const closeTrainings = await this.trainingsService.find({
      where: {
        date: tomorrow.toISOString().split('T')[0] as unknown as Date,
        isCanceled: false,
      },
      relations: {
        transaction: { tariff: true },
        client: { chatType: true },
        trainer: { chatType: true },
        tariff: { type: true },
        club: { studio: true },
        slot: true,
        subscription: { transaction: true },
      },
    });
    if (!closeTrainings || closeTrainings.length === 0) return;

    await Promise.all(
      closeTrainings.map(
        async (training) => await this.sendNotification(training),
      ),
    );
  }

  // @Cron(CronExpression.EVERY_DAY_AT_4PM)
  // async notifyUnpaidTrainings() {
  //   const tomorrow = new Date();
  //   tomorrow.setDate(tomorrow.getDate() + 1);
  //
  //   const unpaidTrainings = await this.trainingsService.find({
  //     where: {
  //       date: tomorrow.toISOString().split('T')[0] as unknown as Date,
  //       isCanceled: false,
  //       transaction: { status: TransactionStatus.Unpaid },
  //     },
  //     relations: {
  //       transaction: { tariff: true },
  //       client: { chatType: true },
  //       trainer: { chatType: true },
  //       tariff: { type: true },
  //       club: { studio: true },
  //       slot: true,
  //       subscription: { transaction: true },
  //     },
  //   });
  //   if (!unpaidTrainings || unpaidTrainings.length === 0) return;
  //
  //   await Promise.all(
  //     unpaidTrainings.map(
  //       async (training) => await this.cancelUnpaidTraining(training),
  //     ),
  //   );
  // }

  private async cancelUnpaidTraining(training: Training) {
    const chatType = training.client?.chatType?.name
      ? training.client?.chatType?.name.toLowerCase()
      : chatTypes.whatsapp;

    const transaction = training.subscription
      ? training.subscription.transaction
      : training.transaction;

    if (!transaction) {
      Logger.error(`Transaction for training #${training.id} is not found`);
      return;
    }

    await Promise.all([
      this.transactionsService.updateOne(training.transaction, {
        status: TransactionStatus.Canceled,
      }),
      this.trainingsService.updateOne(training, { isCanceled: true }),
    ]);

    await this.wazzupMessagingService.sendMessage(
      chatType as NormalizedChatType,
      training.client.phone,
      messageTemplates.notifications.canceledUnpaid(
        dateToRecordString(training.date, training.slot.beginning),
      ),
      notificationMessageTemplates['training-cancellation'](
        training.trainer.getNameWithSurname(),
        training.client.getNameWithSurname(),
        ISODateToString(training.date, false),
        training.slot.beginning,
      ),
    );
  }

  private async sendNotification(training: Training) {
    const chatType = training.client?.chatType?.name
      ? training.client?.chatType?.name.toLowerCase()
      : chatTypes.whatsapp;

    const transaction = training.subscription
      ? training.subscription.transaction
      : training.transaction;

    if (!transaction || transaction.status === TransactionStatus.Unpaid) {
      const tinkoffTransaction = await this.tinkoffPaymentsService.findOne({
        where: { transactionId: transaction.id },
      });

      const tinkoffTransactionState = tinkoffTransaction
        ? await this.tinkoffPaymentsService.getPaymentState(
            tinkoffTransaction.paymentId,
          )
        : undefined;

      let paymentURL: string;
      if (
        tinkoffTransactionState &&
        tinkoffTransactionState.Status == PaymentStatus.Expired
      ) {
        paymentURL = await this.getPaymentURLForTrainingWithExpiredTransaction(
          transaction.id,
          training,
        );
      } else if (
        training.isRepeated &&
        training.tariff &&
        !training.transaction
      ) {
        paymentURL = await this.getPaymentURLForRepeatedTraining(training);
      } else {
        paymentURL = tinkoffTransaction.paymentURL;
      }

      if (!paymentURL) {
        Logger.error(PaymentExceptions.FailedToCreatePayment);
        return;
      }

      await this.wazzupMessagingService.sendMessage(
        chatType as NormalizedChatType,
        training.client.phone,
        messageTemplates.notifications.notifyUnpaid(
          training.trainer.getNameWithSurname(),
          training.club.studio.address,
          training.slot.beginning,
          training.tariff.type.name,
          paymentURL,
        ),
      );
    } else if (transaction.status === TransactionStatus.Paid) {
      await this.wazzupMessagingService.sendMessage(
        chatType as NormalizedChatType,
        training.client.phone,
        messageTemplates.notifications.paidTrainingTomorrow(
          training.trainer.getNameWithSurname(),
          dateToRecordString(training.date, training.slot.beginning),
        ),
      );
      return;
    }
  }

  private async getPaymentURLForTrainingWithExpiredTransaction(
    transactionId: number,
    training: Training,
  ) {
    const newTransaction =
      await this.transactionsService.updateExpiredAndCreteNew(transactionId);

    return await this.tinkoffPaymentsService
      .createPayment({
        transactionId: newTransaction.id,
        amount: newTransaction.cost,
        quantity: 1,
        user: {
          id: training.client.id,
          phone: training.client.phone,
        },
        metadata: {
          name: newTransaction.tariff.name,
          description: `Заказ №${newTransaction.id}`,
        },
      })
      .catch(async (err) => {
        Logger.error('Error due creating paymentURL');
        console.log(err);
        return null;
        // await this.transactionsService.removeOne(transaction);
      });
  }

  private async getPaymentURLForRepeatedTraining(training: Training) {
    const newTransaction = await this.transactionsService.save({
      client: training.client,
      training: training,
      subscription: training.subscription,
      tariff: training.tariff,
      cost: training.tariff.cost,
      paidVia: TransactionPaidVia.OnlineService,
      trainer: training.trainer,
    });

    return await this.tinkoffPaymentsService
      .createPayment({
        transactionId: newTransaction.id,
        amount: newTransaction.cost,
        quantity: 1,
        user: {
          id: training.client.id,
          phone: training.client.phone,
        },
        metadata: {
          name: training.tariff.name,
          description: `Заказ №${newTransaction.id}`,
        },
      })
      .catch(async (err) => {
        Logger.error('Error due creating paymentURL');
        console.log(err);
        return null;
        // await this.transactionsService.removeOne(transaction);
      });
  }
}
