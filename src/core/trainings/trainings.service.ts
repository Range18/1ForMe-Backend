import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOneOptions, In, Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Training } from '#src/core/trainings/entities/training.entity';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { TransactionsService } from '#src/core/transactions/transactions.service';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { UserService } from '#src/core/users/user.service';
import { TrainingCountPerDateRdo } from './rdo/training-count-per-date.rdo';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { TinkoffPaymentsService } from '#src/core/tinkoff-payments/tinkoff-payments.service';
import { messageTemplates } from '#src/core/wazzup-messaging/templates/message-templates';
import { dateToRecordString } from '#src/common/utilities/format-utc-date.func';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';
import { ClubsService } from '#src/core/clubs/clubs.service';
import { NormalizedChatType } from '#src/core/chat-types/types/chat.type';
import { getDateRange } from '#src/common/utilities/date-range.func';
import { GetCreatedTrainingsRdo } from '#src/core/trainings/rdo/get-created-trainings.rdo';
import { ICreateTraining } from '#src/core/trainings/types/create-training.interface';
import { CreateTrainingViaClientDto } from '#src/core/trainings/dto/create-training-via-client.dto';
import { ClientsService } from '#src/core/clients/clients.service';
import ms from 'ms';
import { TransactionPaidVia } from '#src/core/transactions/types/transaction-paid-via.enum';
import { CreateSubscriptionDto } from '#src/core/subscriptions/dto/create-subscription.dto';
import { TrainingTypes } from '#src/core/training-type/types/training-types.enum';
import { notificationMessageTemplates } from '#src/core/wazzup-messaging/templates/notification-message-templates';
import { ISODateToString } from '#src/common/utilities/iso-date-to-string.func';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TrainingCreatedEvent } from '#src/core/trainings/payloads/training-created-event.payload';
import EntityExceptions = AllExceptions.EntityExceptions;
import UserExceptions = AllExceptions.UserExceptions;
import TrainerExceptions = AllExceptions.TrainerExceptions;
import ClubSlotsExceptions = AllExceptions.ClubSlotsExceptions;
import TrainingExceptions = AllExceptions.TrainingExceptions;
import PermissionExceptions = AllExceptions.PermissionExceptions;
import PaymentExceptions = AllExceptions.PaymentExceptions;
import TransactionExceptions = AllExceptions.TransactionExceptions;

@Injectable()
export class TrainingsService extends BaseEntityService<
  Training,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(Training)
    private readonly trainingRepository: Repository<Training>,
    @InjectRepository(ClubSlots)
    private readonly clubSlotsRepository: Repository<ClubSlots>,
    private readonly eventEmitter: EventEmitter2,
    private readonly transactionsService: TransactionsService,
    private readonly tariffsService: TariffsService,
    private readonly userService: UserService,
    private readonly tinkoffPaymentsService: TinkoffPaymentsService,
    private readonly wazzupMessagingService: WazzupMessagingService,
    private readonly clubsService: ClubsService,
    private readonly clientsService: ClientsService,
  ) {
    super(
      trainingRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }

  private async getClients(clientIds: number[]) {
    return await this.userService.find({
      where: { id: In(clientIds) },
      relations: {
        trainers: true,
        chatType: true,
      },
    });
  }

  private async checkIfTrainingExists(
    slotId: number,
    date: Date,
    clubId: number,
    trainerId: number,
  ) {
    const existingTraining = await this.findOne(
      {
        where: [
          {
            slot: { id: slotId },
            date: date,
            club: { id: clubId },
            isCanceled: false,
          },
          {
            slot: { id: slotId },
            date: date,
            isCanceled: false,
            trainer: { id: trainerId },
          },
        ],
        relations: { trainer: true },
      },
      false,
    );

    if (existingTraining && existingTraining.trainer.id === trainerId) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'TrainerExceptions',
        TrainerExceptions.AlreadyWorking,
      );
    } else if (existingTraining) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'TrainingExceptions',
        TrainingExceptions.TrainingAlreadyExists,
      );
    }
  }

  private async getAllEntitiesForTrainingCreation(
    trainerId: number,
    createTrainingDto: ICreateTraining,
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

    const tariff = await this.tariffsService.findOne({
      where: { id: createTrainingDto.tariff },
      relations: { type: true },
    });

    if (!tariff) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    const slot = await this.clubSlotsRepository.findOne({
      where: { id: createTrainingDto.slot },
    });

    if (!slot) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'ClubSlotsExceptions',
        ClubSlotsExceptions.NotFound,
      );
    }

    const club = await this.clubsService.findOne({
      where: { id: createTrainingDto.club },
      relations: { studio: true },
    });

    if (!club) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    return { trainer, slot, tariff, club };
  }

  async create(
    createTrainingDto: ICreateTraining,
    trainerId: number,
    clientIds: number[],
  ): Promise<GetCreatedTrainingsRdo> {
    if (
      createTrainingDto.payVia === TransactionPaidVia.CashBox &&
      createTrainingDto.isRepeated
    ) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'TrainingExceptions',
        TrainingExceptions.RepeatedAndPaidViaCashBox,
      );
    }

    const { trainer, slot, tariff, club } =
      await this.getAllEntitiesForTrainingCreation(
        trainerId,
        createTrainingDto,
      );

    const clients = await this.getClients(clientIds);
    if (!clients && clients.length == 0) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    if (tariff.clientsAmount && clients.length !== tariff.clientsAmount) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'TrainingExceptions',
        TrainingExceptions.ClientsAmountError,
      );
    }

    await this.checkIfTrainingExists(
      slot.id,
      createTrainingDto.date,
      createTrainingDto.club,
      trainerId,
    );

    const trainingsIds: number[] = [];
    let existingTrainingsDates: Date[] = [];
    let firstClient: UserEntity | null;

    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];

      await this.userService.addTrainer(client, trainerId);
      await this.wazzupMessagingService.createContact(client.id, {
        responsibleUserId: trainer.id,
      });

      const transaction = await this.transactionsService.save({
        client: { id: client.id },
        trainer: { id: trainerId },
        tariff: tariff,
        cost: tariff.clientsAmount
          ? tariff.cost / tariff.clientsAmount
          : tariff.cost,
        createdDate: new Date(),
        status:
          createTrainingDto.payVia === TransactionPaidVia.CashBox
            ? TransactionStatus.Paid
            : TransactionStatus.Unpaid,
        paidVia: createTrainingDto.payVia,
      });

      const paymentURL: string | null = await this.tinkoffPaymentsService
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

      const training = await this.save({
        slot: slot,
        date: createTrainingDto.date,
        client: { id: client.id },
        trainer: { id: trainerId },
        club: { id: createTrainingDto.club },
        transaction: transaction,
        isRepeated: createTrainingDto.isRepeated,
        tariff: tariff,
      });

      trainingsIds.push(training.id);

      this.eventEmitter.emit(
        'training.created',
        new TrainingCreatedEvent(training, slot),
      );

      try {
        if (tariff.type.name === TrainingTypes.Split) {
          await this.wazzupMessagingService.sendMessagesAfterSplitTrainingCreated(
            client,
            trainer,
            new Date(training.date),
            slot,
            transaction,
            paymentURL,
            club,
            i === 0 ? 'creator' : 'invited',
            firstClient,
          );
          firstClient = i === 0 ? client : null;
        } else {
          await this.wazzupMessagingService.sendMessagesAfterPersonalTrainingCreated(
            client,
            trainer,
            new Date(training.date),
            slot,
            transaction,
            paymentURL,
            club,
          );
        }
      } catch (error) {
        await this.removeOne(training);
        throw error;
      }

      if (createTrainingDto.isRepeated) {
        existingTrainingsDates = await this.createRepeatedTrainings(
          new Date(createTrainingDto.date),
          slot.id,
          club.id,
          client.id,
          trainerId,
          tariff.id,
          clientIds,
          trainingsIds,
        );
      }
    }

    return new GetCreatedTrainingsRdo(
      await this.find({
        where: { id: In(trainingsIds) },
        relations: {
          client: { avatar: true },
          trainer: { avatar: true },
          transaction: { tariff: { type: true } },
          club: { city: true },
          slot: true,
          tariff: true,
        },
      }),
      existingTrainingsDates,
    );
  }

  async createRepeatedTrainings(
    startDate: Date,
    slotId: number,
    clubId: number,
    clientId: number,
    trainerId: number,
    tariffId: number,
    clientIds: number[],
    trainingsIds: number[],
  ) {
    const dateRange = getDateRange(startDate, 90);
    const existingTrainingsDates: Date[] = [];

    for (let i = 7; i < dateRange.length; i += 7) {
      const existingTraining = await this.findOne(
        {
          where: [
            {
              slot: { id: slotId },
              date: dateRange[i].toISOString().split('T')[0] as unknown as Date,
              club: { id: clubId },
              isCanceled: false,
            },
            {
              slot: { id: slotId },
              date: dateRange[i].toISOString().split('T')[0] as unknown as Date,
              trainer: { id: trainerId },
              isCanceled: false,
            },
          ],
          relations: { client: true },
        },
        false,
      );

      if (existingTraining && !clientIds.includes(existingTraining.client.id)) {
        existingTrainingsDates.push(existingTraining.date);
      } else {
        const training = await this.save({
          slot: { id: slotId },
          date: dateRange[i].toISOString().split('T')[0],
          client: { id: clientId },
          trainer: { id: trainerId },
          club: { id: clubId },
          tariff: { id: tariffId },
          isRepeated: true,
        });

        trainingsIds.push(training.id);
      }
    }
    return existingTrainingsDates;
  }

  async createWithUnknownClients(
    createTrainingViaClientDto: CreateTrainingViaClientDto,
  ) {
    const clients = await Promise.all(
      createTrainingViaClientDto.clients.map(
        async (client) => (await this.clientsService.createClient(client)).id,
      ),
    );
    return await this.create(
      createTrainingViaClientDto,
      createTrainingViaClientDto.trainerId,
      clients,
    );
  }

  async createForSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
    subscriptionEntity: Subscription,
    trainerId: number,
  ) {
    await Promise.all(
      createSubscriptionDto.createTrainingDto.map(async (training) => {
        const existingTraining = await this.findOne(
          {
            where: {
              slot: { id: training.slot },
              date: training.date,
              club: { id: training.club },
              isCanceled: false,
            },
          },
          false,
        );

        if (existingTraining) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'TrainingExceptions',
            TrainingExceptions.TrainingAlreadyExists,
          );
        }
      }),
    );

    return await Promise.all(
      createSubscriptionDto.createTrainingDto.map(async (training) => {
        return await this.save({
          date: training.date,
          slot: { id: training.slot },
          client: { id: createSubscriptionDto.client },
          trainer: { id: trainerId },
          club: { id: training.club },
          subscription: subscriptionEntity,
        });
      }),
    );
  }

  async cancelTraining(id: number, userId: number) {
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

    const training = await this.findOne({
      where: { id: id, isCanceled: false },
      relations: {
        transaction: true,
        client: { chatType: true },
        trainer: { chatType: true },
        slot: true,
        club: true,
      },
    });

    if (!training) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'TrainingExceptions',
        TrainingExceptions.NotFound,
      );
    }

    if (user.role.name === 'client' && training.client.id !== user.id) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'PermissionExceptions',
        PermissionExceptions.NoRequiredRole,
      );
    } else if (
      user.role.name === 'trainer' &&
      training.trainer.id !== user.id
    ) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'PermissionExceptions',
        PermissionExceptions.NotTheSameUser,
      );
    }

    const chatType = training.client.chatType
      ? training.client.chatType.name.toLowerCase()
      : 'whatsapp';

    switch (training.transaction.status) {
      case TransactionStatus.Paid:
        await Promise.all([
          this.tinkoffPaymentsService.cancelOrRefundPayment(
            training.transaction.id,
          ),
          this.updateOne(training, { isCanceled: true }),
        ]);

        await this.wazzupMessagingService.sendMessage(
          chatType as NormalizedChatType,
          training.client.phone,
          messageTemplates.notifications.canceled(
            dateToRecordString(
              new Date(training.date),
              training.slot.beginning,
            ),
          ),
        );
        break;

      case TransactionStatus.Unpaid:
      case TransactionStatus.Expired:
        await Promise.all([
          this.transactionsService.updateOne(training.transaction, {
            status: TransactionStatus.Canceled,
          }),
          this.updateOne(training, { isCanceled: true }),
        ]);

        await this.wazzupMessagingService.sendMessage(
          chatType as NormalizedChatType,
          training.client.phone,
          messageTemplates.notifications.canceledUnpaid(
            dateToRecordString(
              new Date(training.date),
              training.slot.beginning,
            ),
          ),
        );
        break;

      default:
        await this.updateOne(training, { isCanceled: true });
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'TransactionExceptions',
          TransactionExceptions.AlreadyCanceled,
        );
    }

    await this.wazzupMessagingService.sendNotificationToOwner(
      notificationMessageTemplates['training-cancellation'](
        training.trainer.getNameWithSurname(),
        training.client.getNameWithSurname(),
        ISODateToString(new Date(training.date), false),
        training.slot.beginning,
      ),
    );
  }

  async cancelRepeatedTraining(id: number, userId: number) {
    const training = await this.findOne({
      where: { id: id, isCanceled: false },
      relations: {
        transaction: true,
        client: { chatType: true },
        trainer: true,
        slot: true,
        club: true,
      },
    });

    if (!training) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'TrainingExceptions',
        TrainingExceptions.NotFound,
      );
    }

    const trainings = await this.find({
      where: {
        trainer: { id: training.trainer.id },
        client: { id: training.client.id },
        club: { id: training.club.id },
        slot: { id: training.slot.id },
        isRepeated: training.isRepeated,
        isCanceled: false,
        date: In(getDateRange(new Date(training.date), 92, 7)),
      },
      relations: {
        transaction: true,
        client: { chatType: true },
        trainer: true,
        slot: true,
        club: true,
      },
    });

    return await Promise.all(
      trainings.map(
        async (current) => await this.cancelTraining(current.id, userId),
      ),
    );
  }

  async getTrainingsPerDay(trainerId: number) {
    const yesterday = new Date();
    yesterday.setTime(yesterday.getTime() - ms('1d'));
    return (
      await this.trainingRepository
        .createQueryBuilder('training')
        .select([
          'DAY(training.`date`) as day',
          'MONTH(training.`date`) as month',
          'COUNT(training.`id`) as trainingCount',
          'training.trainer',
        ])
        .where('training.trainer = :trainerId', { trainerId })
        .andWhere('training.isCanceled = :isCanceled', { isCanceled: false })
        .andWhere('training.date >= :date', {
          date: yesterday.toISOString().split('T')[0] as unknown as Date,
        })
        .addGroupBy('DAY(training.`date`)')
        .addGroupBy('MONTH(training.`date`)')
        .getRawMany()
    ).map(
      (entity) =>
        new TrainingCountPerDateRdo(
          entity.trainingCount,
          entity.day,
          entity.month,
        ),
    );
  }

  async updateOneWithMsg(
    optionsOrEntity: FindOneOptions<Training>,
    toUpdate: DeepPartial<Training>,
    throwError = true,
  ) {
    const training = await this.findOne(optionsOrEntity);

    if (
      training.date == toUpdate.date &&
      training.slot.id == toUpdate.slot.id &&
      training.club.id == toUpdate.club?.id
    ) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'TrainingExceptions',
        TrainingExceptions.TrainingAlreadyExists,
      );
    }

    await super.updateOne(training, toUpdate, throwError);

    const newTraining = await this.findOne({
      where: { id: training.id },
      relations: { slot: true },
    });

    await this.wazzupMessagingService.sendMessage(
      training.client.chatType?.name?.toLowerCase() as NormalizedChatType,
      training.client.phone,
      messageTemplates.notifications.reschedulingTraining(
        dateToRecordString(
          new Date(newTraining.date),
          newTraining.slot.beginning,
        ),
      ),
    );

    return newTraining;
  }
}
