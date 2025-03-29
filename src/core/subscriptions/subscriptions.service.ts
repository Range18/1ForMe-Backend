import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { CreateSubscriptionDto } from '#src/core/subscriptions/dto/create-subscription.dto';
import { TrainingsService } from '#src/core/trainings/trainings.service';
import { UserService } from '#src/core/users/user.service';
import { TransactionsService } from '#src/core/transactions/transactions.service';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
import { TinkoffPaymentsService } from '#src/core/tinkoff-payments/tinkoff-payments.service';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { StudioSlotsService } from '#src/core/studio-slots/studio-slots.service';
import { GetSubscriptionRdo } from '#src/core/subscriptions/rdo/get-subscription.rdo';
import ms from 'ms';
import { TransactionPaidVia } from '#src/core/transactions/types/transaction-paid-via.enum';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateSubscriptionViaCardDto } from '#src/core/subscriptions/dto/create-subscription-via-card.dto';
import { SubscriptionCardsService } from '#src/core/subscription-cards/subscription-cards.service';
import { frontendServer } from '#src/common/configs/config';
import EntityExceptions = AllExceptions.EntityExceptions;
import UserExceptions = AllExceptions.UserExceptions;
import ClubSlotsExceptions = AllExceptions.ClubSlotsExceptions;
import SubscriptionExceptions = AllExceptions.SubscriptionExceptions;
import PermissionExceptions = AllExceptions.PermissionExceptions;
import TrainerExceptions = AllExceptions.TrainerExceptions;

@Injectable()
export class SubscriptionsService extends BaseEntityService<
  Subscription,
  'SubscriptionExceptions',
  GetSubscriptionRdo
> {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly userService: UserService,
    private readonly transactionsService: TransactionsService,
    private readonly tariffsService: TariffsService,
    private readonly tinkoffPaymentsService: TinkoffPaymentsService,
    private readonly wazzupMessagingService: WazzupMessagingService,
    private readonly clubSlotsService: StudioSlotsService,
    private readonly trainingsService: TrainingsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly subscriptionCardsService: SubscriptionCardsService,
  ) {
    super(
      subscriptionRepository,
      new ApiException<'SubscriptionExceptions'>(
        HttpStatus.NOT_FOUND,
        'SubscriptionExceptions',
        SubscriptionExceptions.NotFound,
      ),
      GetSubscriptionRdo,
    );
  }

  private async getNecessaryEntities(
    createSubscriptionDto: CreateSubscriptionDto,
  ) {
    const client = await this.userService.findOne({
      where: { id: createSubscriptionDto.client },
      relations: { chatType: true },
    });

    if (!client) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    const tariff = await this.tariffsService.findOne({
      where: { id: createSubscriptionDto.tariff, isPublic: true },
    });

    if (!tariff) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    if (
      tariff.trainingAmount != createSubscriptionDto.createTrainingDto.length
    ) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'SubscriptionExceptions',
        SubscriptionExceptions.TrainingAmountErr,
      );
    }

    return { client, tariff };
  }

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    trainerId: number,
  ) {
    const trainer = await this.userService.findOne({
      where: { id: trainerId },
      relations: { slots: true, chatType: true },
    });

    if (!trainer.isTrainerActive) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'TrainerExceptions',
        TrainerExceptions.NotWorking,
      );
    }

    const { client, tariff } = await this.getNecessaryEntities(
      createSubscriptionDto,
    );

    const firstTrainingSlot = await this.clubSlotsService.findOne({
      where: { id: createSubscriptionDto.createTrainingDto[0].slot },
    });

    if (!firstTrainingSlot) {
      new ApiException(
        HttpStatus.NOT_FOUND,
        'ClubSlotsExceptions',
        ClubSlotsExceptions.NotFound,
      );
    }

    const transaction = await this.transactionsService.save({
      client: client,
      trainer: { id: trainerId },
      cost: tariff.cost,
      tariff: { id: createSubscriptionDto.tariff },
      createdDate: new Date(),
      status:
        createSubscriptionDto.payVia === TransactionPaidVia.CashBox
          ? TransactionStatus.Paid
          : TransactionStatus.Unpaid,
      paidVia: createSubscriptionDto.payVia,
    });

    const subId = (
      await this.save({
        client: client,
        trainer: { id: trainerId },
        transaction: transaction,
        expireAt: tariff.subExpireAt
          ? new Date(Date.now() + tariff.subExpireAt * ms('24h'))
          : undefined,
      })
    ).id;

    const subscription = await this.findOne({
      where: { id: subId },
      relations: {
        transaction: { tariff: true },
        trainer: { chatType: true },
        client: { chatType: true },
      },
    });

    await this.trainingsService.createForSubscription(
      createSubscriptionDto,
      subscription,
      trainerId,
    );

    const paymentURL = await this.tinkoffPaymentsService
      .createPayment({
        transactionId: transaction.id,
        amount: transaction.cost,
        quantity: 1,
        user: {
          id: client.id,
          phone: client.phone,
        },
        metadata: {
          name: tariff.name,
          description: `Заказ №${transaction.id}`,
        },
        successURL: `${frontendServer.url}/subscription/success/${subId}`,
      })
      .catch(async () => {
        await this.transactionsService.removeOne(transaction);
      });

    if (!paymentURL) {
      Logger.log('Payment url creation error in subscription service');
      return;
    }

    this.eventEmitter.emit('subscription.created', subscription);

    await this.wazzupMessagingService.sendMessageAfterSubscriptionPurchased(
      subscription,
      paymentURL,
    );

    return await this.findOne({
      where: { id: subId },
      relations: {
        client: true,
        trainer: true,
        transaction: { tariff: { sport: true, type: true } },
        trainings: { club: true, slot: true },
      },
    });
  }

  async createViaCard(dto: CreateSubscriptionViaCardDto) {
    const client = await this.userService.findOrCreate({
      name: dto.name,
      phone: dto.phone,
      chatType: dto.chatTypeId,
      userNameInMessenger: dto.username,
    });

    const giftCard = await this.subscriptionCardsService.findOne({
      where: { id: dto.giftCardId },
      relations: { tariff: { type: true, category: true } },
    });

    const transaction = await this.transactionsService.save({
      client: client,
      cost: giftCard.tariff.cost,
      tariff: { id: giftCard.tariff.id },
      createdDate: new Date(),
      paidVia: TransactionPaidVia.OnlineService,
    });

    const paymentURL = await this.tinkoffPaymentsService
      .createPayment({
        transactionId: transaction.id,
        amount: transaction.cost,
        quantity: 1,
        user: {
          id: client.id,
          phone: client.phone,
        },
        metadata: {
          name: giftCard.tariff.name,
          description: `Заказ №${transaction.id}`,
        },
      })
      .catch(async () => {
        await this.transactionsService.removeOne(transaction);
      });

    if (!paymentURL) {
      Logger.log('Payment url creation error in subscription service');
      return;
    }

    const { id } = await this.save({
      client: client,
      transaction: transaction,
      category: giftCard.tariff.category,
      trainingType: giftCard.tariff.type,
      isRenewable: dto.isRenewable,
      expireAt: giftCard.tariff.subExpireAt
        ? new Date(Date.now() + giftCard.tariff.subExpireAt * ms('24h'))
        : undefined,
    });

    const subscription = await this.findOne({
      where: { id: id },
      relations: {
        transaction: { tariff: { sport: true, type: true } },
        trainings: { club: true, slot: true },
        trainer: { chatType: true },
        client: { chatType: true },
      },
    });

    this.eventEmitter.emit('subscription.created', subscription);

    await this.wazzupMessagingService.sendMessageAfterSubscriptionViaClientCardPurchased(
      subscription,
    );

    return { subscription, paymentURL };
  }

  async cancelSubscription(id: number, userId: number): Promise<void> {
    const user = await this.userService.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    if (!user) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    const subscription = await this.findOne({
      where: { id: id },
      relations: { transaction: true, client: true, trainer: true },
    });

    if (!subscription) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'SubscriptionExceptions',
        SubscriptionExceptions.NotFound,
      );
    }

    if (new GetSubscriptionRdo(subscription).finishedTrainingsCount !== 0) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'SubscriptionExceptions',
        SubscriptionExceptions.CancelingForbidden,
      );
    }

    if (user.role.name === 'client' && subscription.client.id !== user.id) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'PermissionExceptions',
        PermissionExceptions.NoRequiredRole,
      );
    } else if (
      user.role.name === 'trainer' &&
      subscription.trainer.id !== user.id
    ) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'PermissionExceptions',
        PermissionExceptions.NoRequiredRole,
      );
    }

    await this.tinkoffPaymentsService.cancelOrRefundPayment(
      subscription.transaction.id,
    );

    await Promise.all(
      subscription?.trainings?.map(
        async (training) =>
          await this.trainingsService.updateOne(training, { isCanceled: true }),
      ),
    );
  }
}
