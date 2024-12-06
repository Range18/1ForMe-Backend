import { Injectable, Logger } from '@nestjs/common';
import { TrainingsService } from '#src/core/trainings/trainings.service';
import { Cron } from '@nestjs/schedule';
import console from 'node:console';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';
import { messageTemplates } from '#src/core/wazzup-messaging/message-templates';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { TinkoffPaymentsService } from '#src/core/tinkoff-payments/tinkoff-payments.service';
import { Training } from '#src/core/trainings/entities/training.entity';
import { ChatTypes } from '#src/core/chat-types/types/chat-types.enum';
import { PaymentStatus } from '#src/core/tinkoff-payments/enums/payment-status.enum';
import { TransactionsService } from '#src/core/transactions/transactions.service';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import PaymentExceptions = AllExceptions.PaymentExceptions;

@Injectable()
export class NotifyClosestTrainingService {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly wazzupMessagingService: WazzupMessagingService,
    private readonly tinkoffPaymentsService: TinkoffPaymentsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  private async sendNotification(training: Training) {
    const chatType = training.client.chatType.name
      ? training.client.chatType.name.toLowerCase()
      : ChatTypes.WhatsApp;

    const transaction = training.subscription
      ? training.subscription.transaction
      : training.transaction;

    if (!transaction) {
      Logger.error(`Transaction for training #${training.id} is not found`);
      return;
    }

    if (transaction.status === TransactionStatus.Paid)
      await this.sendForPaidTraining(training, chatType);
    else if (transaction.status === TransactionStatus.Unpaid) {
      const tinkoffTransaction = await this.tinkoffPaymentsService.findOne({
        where: { transactionId: training.transaction.id },
      });

      const tinkoffTransactionState = tinkoffTransaction
        ? await this.tinkoffPaymentsService.getPaymentState(
            tinkoffTransaction.paymentId,
          )
        : undefined;

      console.log(tinkoffTransactionState);

      let paymentURL;
      if (
        tinkoffTransactionState &&
        tinkoffTransactionState.Status == PaymentStatus.Expired
      ) {
        const expiredTransaction = await this.transactionsService.findOne({
          where: { id: transaction.id },
          relations: {
            client: true,
            subscription: true,
            tariff: true,
            training: true,
            trainer: true,
          },
        });

        await this.transactionsService.updateOne(expiredTransaction, {
          training: null,
          subscription: null,
          status: TransactionStatus.Expired,
        });

        const newTransaction = await this.transactionsService.save({
          client: expiredTransaction.client,
          training: expiredTransaction.training,
          subscription: expiredTransaction.subscription,
          tariff: expiredTransaction.tariff,
          cost: expiredTransaction.cost,
          paidVia: expiredTransaction.paidVia,
          trainer: expiredTransaction.trainer,
          status: expiredTransaction.status,
        });

        paymentURL = await this.tinkoffPaymentsService
          .createPayment({
            transactionId: newTransaction.id,
            amount: newTransaction.cost,
            quantity: 1,
            user: {
              id: training.client.id,
              phone: training.client.phone,
            },
            metadata: {
              name: transaction.tariff.name,
              description: `Заказ №${newTransaction.id}`,
            },
          })
          .catch(async (err) => {
            Logger.error('Error due creating paymentURL');
            console.log(err);
            return null;
            // await this.transactionsService.removeOne(transaction);
          });
      } else {
        paymentURL = tinkoffTransaction.paymentURL;
      }

      if (!paymentURL) {
        Logger.error(PaymentExceptions.FailedToCreatePayment);
        return;
      }

      await this.sendForUnPaidTraining(training, chatType, paymentURL);
    }
  }

  async sendForPaidTraining(training: Training, chatType: string) {
    if (chatType == 'telegram') {
      //Paid training notification in telegram
      await this.wazzupMessagingService.sendTelegramMessage(
        training.client.phone,
        messageTemplates['notify-about-tomorrow-paid-training'](
          training.club.address,
          training.slot.beginning,
        ),
      );
    }

    //Paid training notification in whatsapp
    await this.wazzupMessagingService.sendWhatsAppMessage(
      training.client.phone,
      messageTemplates['notify-about-tomorrow-paid-training'](
        training.club.address,
        training.slot.beginning,
      ),
    );
  }

  async sendForUnPaidTraining(
    training: Training,
    chatType: string,
    paymentURL: string,
  ) {
    if (chatType == 'telegram') {
      //Unpaid training notification in telegram
      await this.wazzupMessagingService.sendTelegramMessage(
        training.client.phone,
        messageTemplates['notify-about-tomorrow-unpaid-training'](
          training.club.studio.address,
          training.slot.beginning,
          paymentURL,
        ),
      );
    }

    //Unpaid training notification in whatsapp
    await this.wazzupMessagingService.sendWhatsAppMessage(
      training.client.phone,
      messageTemplates['notify-about-tomorrow-unpaid-training'](
        training.club.address,
        training.slot.beginning,
        paymentURL,
      ),
    );
  }

  @Cron('0 0 12 * * *', { name: 'notificationsAboutCloseTraining' })
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
}
