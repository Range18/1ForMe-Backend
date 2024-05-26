import { HttpStatus, Injectable } from '@nestjs/common';
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
import EntityExceptions = AllExceptions.EntityExceptions;
import UserExceptions = AllExceptions.UserExceptions;
import { TinkoffPaymentsService } from '#src/core/tinkoff-payments/tinkoff-payments.service';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { messageTemplates } from '#src/core/wazzup-messaging/message-templates';

@Injectable()
export class SubscriptionsService extends BaseEntityService<
  Subscription,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly trainingsService: TrainingsService,
    private readonly userService: UserService,
    private readonly transactionsService: TransactionsService,
    private readonly tariffsService: TariffsService,
    private readonly tinkoffPaymentsService: TinkoffPaymentsService,
    private readonly wazzupMessagingService: WazzupMessagingService,
  ) {
    super(
      subscriptionRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    trainerId: number,
  ) {
    const client = await this.userService.findOne({
      where: { id: createSubscriptionDto.client },
    });

    if (!client) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    const tariff = await this.tariffsService.findOne({
      where: { id: createSubscriptionDto.tariff },
    });

    if (!tariff) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    const transaction = await this.transactionsService.save({
      client: client,
      trainer: { id: trainerId },
      cost: tariff.cost,
      tariff: { id: createSubscriptionDto.tariff },
      createdDate: new Date(),
    });

    const subId = (
      await this.save({
        client: client,
        trainer: { id: trainerId },
        transaction: transaction,
        expireAt: tariff.subExpireAt
          ? new Date(Date.now() + tariff.subExpireAt * 24 * 60 * 60 * 1000)
          : undefined,
      })
    ).id;

    const subscription = await this.findOne({
      where: { id: subId },
      relations: { transaction: { tariff: true } },
    });

    await this.trainingsService.createForSubscription(
      createSubscriptionDto.createTrainingDto,
      trainerId,
      client.id,
      subscription,
      createSubscriptionDto.type,
    );

    const paymentURL = await this.tinkoffPaymentsService.createPayment({
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
    });

    await this.wazzupMessagingService.sendMessage(
      client.chatType.name,
      client.phone,
      messageTemplates['subscription-booking'](
        createSubscriptionDto.createTrainingDto.length,
        transaction.cost,
        paymentURL,
      ),
    );

    return await this.findOne({
      where: { id: subId },
      relations: {
        client: true,
        trainer: true,
        transaction: { tariff: { sport: true } },
        trainings: { type: true, club: true, slot: true },
      },
    });
  }
}
