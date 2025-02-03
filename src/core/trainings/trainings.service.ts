import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOneOptions, In, Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Training } from '#src/core/trainings/entities/training.entity';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { CreateTrainingDto } from '#src/core/trainings/dto/create-training.dto';
import { TransactionsService } from '#src/core/transactions/transactions.service';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { UserService } from '#src/core/users/user.service';
import { TrainingCountPerDateRdo } from './rdo/training-count-per-date.rdo';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { TinkoffPaymentsService } from '#src/core/tinkoff-payments/tinkoff-payments.service';
import { messageTemplates } from '#src/core/wazzup-messaging/message-templates';
import { dateToRecordString } from '#src/common/utilities/format-utc-date.func';
import { ClubSlots } from '#src/core/club-slots/entities/club-slot.entity';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';
import { ClubsService } from '#src/core/clubs/clubs.service';
import { NormalizedChatType } from '#src/core/wazzup-messaging/types/chat.type';
import { getDateRange } from '#src/common/utilities/date-range.func';
import { GetCreatedTrainingsRdo } from '#src/core/trainings/rdo/get-created-trainings.rdo';
import { ICreateTraining } from '#src/core/trainings/types/create-training.interface';
import { CreateTrainingViaClientDto } from '#src/core/trainings/dto/create-training-via-client.dto';
import { ClientsService } from '#src/core/clients/clients.service';
import ms from 'ms';
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
  ) {
    const existingTraining = await this.findOne(
      {
        where: {
          slot: { id: slotId },
          date: date,
          club: { id: clubId },
          isCanceled: false,
        },
      },
      false,
    );

    if (existingTraining) {
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
      where: { id: createTrainingDto.tariff, isPublic: true },
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
    );

    const trainingsIds: number[] = [];
    const existingTrainingsDates = [];

    for (const client of clients) {
      const trainerIds = client.trainers.map((trainer) => trainer.id);

      if (!trainerIds.includes(trainer.id)) {
        client.trainers.push({ id: trainerId } as UserEntity);
        await this.userService.save(client);
      }
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
            name: tariff.name,
            description: `Заказ №${transaction.id}`,
          },
        })
        .catch(async () => {
          await this.transactionsService.removeOne(transaction);
        });

      if (!paymentURL) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'PaymentExceptions',
          PaymentExceptions.FailedToCreatePayment,
        );
      }

      await this.wazzupMessagingService.sendMessage(
        client.chatType.name,
        client.phone,
        messageTemplates['single-training-booking'](
          transaction.cost,
          dateToRecordString(createTrainingDto.date, slot.beginning),
          paymentURL,
          club.studio.name,
          club.studio.address,
        ),
      );

      await this.wazzupMessagingService.sendMessage(
        trainer.chatType?.name ?? 'telegram',
        trainer.phone,
        messageTemplates['single-training-booking-for-trainer'](
          transaction.cost,
          dateToRecordString(createTrainingDto.date, slot.beginning),
          club.studio.name,
          club.studio.address,
        ),
      );

      const training = await this.save({
        slot: slot,
        date: createTrainingDto.date,
        client: { id: client.id },
        trainer: { id: trainerId },
        club: { id: createTrainingDto.club },
        transaction: transaction,
        isRepeated: createTrainingDto.isRepeated,
      });

      trainingsIds.push(training.id);

      if (createTrainingDto.isRepeated) {
        const dateRange = getDateRange(new Date(createTrainingDto.date), 90);

        for (let i = 7; i < dateRange.length; i += 7) {
          const existingTraining = await this.findOne(
            {
              where: {
                slot: { id: slot.id },
                date: dateRange[i]
                  .toISOString()
                  .split('T')[0] as unknown as Date,
                club: { id: createTrainingDto.club },
                isCanceled: false,
              },
              relations: { client: true },
            },
            false,
          );

          if (
            existingTraining &&
            !clientIds.includes(existingTraining.client.id)
          ) {
            existingTrainingsDates.push(existingTraining.date);
          } else {
            const trainingTransaction = await this.transactionsService.save({
              client: { id: client.id },
              trainer: { id: trainerId },
              tariff: tariff,
              cost: tariff.clientsAmount
                ? tariff.cost / tariff.clientsAmount
                : tariff.cost,
              createdDate: new Date(),
            });

            const training = await this.save({
              slot: slot,
              date: dateRange[i].toISOString().split('T')[0],
              client: { id: client.id },
              trainer: { id: trainerId },
              club: { id: createTrainingDto.club },
              transaction: trainingTransaction,
              isRepeated: createTrainingDto.isRepeated,
            });

            trainingsIds.push(training.id);
          }
        }
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
        },
      }),
      existingTrainingsDates,
    );
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
    createTrainingDtoArray: Omit<
      CreateTrainingDto,
      'type' | 'client' | 'tariff'
    >[],
    trainerId: number,
    clientId: number,
    subscriptionEntity: Subscription,
  ) {
    await Promise.all(
      createTrainingDtoArray.map(async (training) => {
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

    await Promise.all(
      createTrainingDtoArray.map(async (training) => {
        return await this.save({
          date: training.date,
          slot: { id: training.slot },
          client: { id: clientId },
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
          chatType as unknown as NormalizedChatType,
          training.client.phone,
          messageTemplates['training-is-refunded'](
            dateToRecordString(training.date, training.slot.beginning),
            training.transaction.cost,
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
          chatType as unknown as NormalizedChatType,
          training.client.phone,
          messageTemplates['training-is-canceled'](
            dateToRecordString(training.date, training.slot.beginning),
          ),
        );
        break;

      default:
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'TransactionExceptions',
          TransactionExceptions.AlreadyCanceled,
        );
    }
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
    const oldDate = dateToRecordString(training.date, training.slot.beginning);

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
      training.client.chatType.name as unknown as NormalizedChatType,
      training.client.phone,
      messageTemplates['training-date-is-changed'](
        oldDate,
        dateToRecordString(newTraining.date, newTraining.slot.beginning),
      ),
    );

    return newTraining;
  }
}
