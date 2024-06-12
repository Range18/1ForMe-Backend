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
import console from 'node:console';
import { Cron } from '@nestjs/schedule';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';
import { ClubsService } from '#src/core/clubs/clubs.service';
import { NormalizedChatType } from '#src/core/wazzup-messaging/types/chat.type';
import EntityExceptions = AllExceptions.EntityExceptions;
import UserExceptions = AllExceptions.UserExceptions;
import TrainerExceptions = AllExceptions.TrainerExceptions;
import ClubSlotsExceptions = AllExceptions.ClubSlotsExceptions;
import TrainingExceptions = AllExceptions.TrainingExceptions;
import PermissionExceptions = AllExceptions.PermissionExceptions;

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

  async create(
    createTrainingDto: CreateTrainingDto,
    trainerId: number,
    clientIds: number[],
  ) {
    createTrainingDto.tariff = Number(createTrainingDto.tariff);
    const trainer = await this.userService.findOne({
      where: { id: trainerId },
      relations: { slots: true },
    });

    if (!trainer.isTrainerActive) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'TrainerExceptions',
        TrainerExceptions.NotWorking,
      );
    }

    //TODO check slots

    const tariff = await this.tariffsService.findOne({
      where: { id: createTrainingDto.tariff },
    });

    if (!tariff) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    let clients: UserEntity[];

    if (tariff.clientsAmount) {
      clients = await this.userService.find({
        where: { id: In(clientIds) },
        relations: {
          trainers: true,
          chatType: true,
        },
      });
    } else {
      clients = [
        await this.userService.findOne({
          where: { id: clientIds[0] },
          relations: {
            trainers: true,
            chatType: true,
          },
        }),
      ];
    }

    if (!clients && clients.length == 0) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    const trainingsIds: number[] = [];

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

    const existingTraining = await this.findOne(
      {
        where: {
          slot: { id: slot.id },
          date: createTrainingDto.date,
          club: { id: createTrainingDto.club },
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

    for (const client of clients) {
      if (client.trainers.every((trainer) => trainer.id !== trainerId)) {
        client.trainers.push({ id: trainerId } as UserEntity);
        await this.userService.save(client);
      }
      console.log(client.trainers);
      console.log(client.trainers.every((trainer) => trainer.id !== trainerId));

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

      if (!paymentURL) return;

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

      const training = await this.save({
        slot: slot,
        date: createTrainingDto.date,
        client: { id: client.id },
        trainer: { id: trainerId },
        club: { id: createTrainingDto.club },
        transaction: transaction,
      });

      trainingsIds.push(training.id);
    }

    return await this.find({
      where: { id: In(trainingsIds) },
      relations: {
        client: { avatar: true },
        trainer: { avatar: true },
        transaction: { tariff: { type: true } },
        club: { city: true },
        slot: true,
      },
    });
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

  async cancelTraining(id: number, userId: number): Promise<void> {
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
        PermissionExceptions.NoRequiredRole,
      );
    }

    const chatType = training.client.chatType
      ? training.client.chatType.name.toLowerCase()
      : 'whatsapp';
    const transactionStatus = training.transaction.status;

    if (training.transaction.status === TransactionStatus.Paid) {
      await this.tinkoffPaymentsService.cancelOrRefundPayment(
        training.transaction.id,
      );

      await this.wazzupMessagingService.sendMessage(
        chatType as unknown as NormalizedChatType,
        training.client.phone,
        messageTemplates['training-is-refunded'](
          dateToRecordString(training.date, training.slot.beginning),
          training.transaction.cost,
        ),
      );
    } else if (training.transaction.status === TransactionStatus.Unpaid) {
      await this.transactionsService.updateOne(training.transaction, {
        status: TransactionStatus.Canceled,
      });

      await this.wazzupMessagingService.sendMessage(
        chatType as unknown as NormalizedChatType,
        training.client.phone,
        messageTemplates['training-is-canceled'](
          dateToRecordString(training.date, training.slot.beginning),
        ),
      );
    }

    await this.updateOne(training, { isCanceled: true });
  }

  async getTrainingsPerDay(trainerId: number, from?: string, to?: string) {
    return (
      await this.trainingRepository
        .createQueryBuilder('training')
        .select([
          'DAY(training.`date`) as day',
          'MONTH(training.`date`) as month',
          'COUNT(training.`id`) as trainingCount',
        ])
        .where('training.trainer = :trainerId', { trainerId })
        .addGroupBy('DAY(training.`date`)')
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

  @Cron('0 0 12 * * *', { name: 'notificationsAboutCloseTraining' })
  async notifyAboutCloseTraining() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(tomorrow);

    const closeTrainings = await this.find({
      where: {
        date: tomorrow.toISOString().split('T')[0] as unknown as Date,
        isCanceled: false,
      },
      relations: {
        transaction: true,
        client: { chatType: true },
        club: { studio: true },
        slot: true,
        subscription: { transaction: true },
      },
    });

    if (!closeTrainings || closeTrainings.length === 0) {
      return;
    }

    await Promise.all(
      closeTrainings.map(async (training) => {
        const chatType = training.client.chatType.name
          ? training.client.chatType.name.toLowerCase()
          : 'whatsapp';

        const transaction = training.subscription
          ? training.subscription.transaction
          : training.transaction;

        if (chatType === 'telegram') {
          if (transaction.status === TransactionStatus.Paid) {
            //Paid training notification in telegram
            await this.wazzupMessagingService.sendTelegramMessage(
              training.client.phone,
              messageTemplates['notify-about-tomorrow-paid-training'](
                training.club.address,
                training.slot.beginning,
              ),
            );
          } else if (transaction.status === TransactionStatus.Unpaid) {
            //Unpaid training notification in telegram
            const tinkoffTransaction =
              await this.tinkoffPaymentsService.findOne({
                where: { transactionId: training.transaction.id },
              });

            await this.wazzupMessagingService.sendTelegramMessage(
              training.client.phone,
              messageTemplates['notify-about-tomorrow-unpaid-training'](
                training.club.studio.address,
                training.slot.beginning,
                tinkoffTransaction.paymentURL,
              ),
            );
          }
        } else {
          if (transaction.status === TransactionStatus.Paid) {
            //Paid training notification in whatsapp
            await this.wazzupMessagingService.sendWhatsAppMessage(
              training.client.phone,
              messageTemplates['notify-about-tomorrow-paid-training'](
                training.club.address,
                training.slot.beginning,
              ),
            );
          } else if (transaction.status === TransactionStatus.Unpaid) {
            //Unpaid training notification in whatsapp
            const tinkoffTransaction =
              await this.tinkoffPaymentsService.findOne({
                where: { transactionId: training.transaction.id },
              });

            await this.wazzupMessagingService.sendWhatsAppMessage(
              training.client.phone,
              messageTemplates['notify-about-tomorrow-unpaid-training'](
                training.club.address,
                training.slot.beginning,
                tinkoffTransaction.paymentURL,
              ),
            );
          }
        }
      }),
    );
  }
}
