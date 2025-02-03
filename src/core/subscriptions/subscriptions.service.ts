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
import { messageTemplates } from '#src/core/wazzup-messaging/message-templates';
import { dateToRecordString } from '#src/common/utilities/format-utc-date.func';
import { StudioSlotsService } from '#src/core/club-slots/studio-slots.service';
import { GetSubscriptionRdo } from '#src/core/subscriptions/rdo/get-subscription.rdo';
import { ClubsService } from '#src/core/clubs/clubs.service';
import ms from 'ms';
import EntityExceptions = AllExceptions.EntityExceptions;
import UserExceptions = AllExceptions.UserExceptions;
import ClubSlotsExceptions = AllExceptions.ClubSlotsExceptions;
import SubscriptionExceptions = AllExceptions.SubscriptionExceptions;
import PermissionExceptions = AllExceptions.PermissionExceptions;
import TrainerExceptions = AllExceptions.TrainerExceptions;

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
    private readonly clubSlotsService: StudioSlotsService,
    private readonly clubsService: ClubsService,
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

    const club = await this.clubsService.findOne({
      where: { id: createSubscriptionDto.createTrainingDto[0].club },
      relations: { studio: true },
    });

    if (!club) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    return { client, tariff, club };
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

    const { client, tariff, club } = await this.getNecessaryEntities(
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
      relations: { transaction: { tariff: true } },
    });

    await this.trainingsService.createForSubscription(
      createSubscriptionDto.createTrainingDto,
      trainerId,
      client.id,
      subscription,
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
      })
      .catch(async () => {
        await this.transactionsService.removeOne(transaction);
      });

    if (!paymentURL) {
      Logger.log('Payment url creation error in subscription service');
      return;
    }

    await this.wazzupMessagingService.sendMessage(
      client.chatType.name,
      client.phone,
      messageTemplates['subscription-booking'](
        createSubscriptionDto.createTrainingDto.length,
        transaction.cost,
        paymentURL,
        dateToRecordString(
          createSubscriptionDto.createTrainingDto[0].date,
          firstTrainingSlot.beginning,
        ),
        club.studio.name,
        club.studio.address,
      ),
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
