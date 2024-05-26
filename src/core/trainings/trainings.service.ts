import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
import EntityExceptions = AllExceptions.EntityExceptions;
import UserExceptions = AllExceptions.UserExceptions;
import TrainerExceptions = AllExceptions.TrainerExceptions;
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { TinkoffPaymentsService } from '#src/core/tinkoff-payments/tinkoff-payments.service';
import { messageTemplates } from '#src/core/wazzup-messaging/message-templates';

@Injectable()
export class TrainingsService extends BaseEntityService<
  Training,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(Training)
    private readonly trainingRepository: Repository<Training>,
    private readonly transactionsService: TransactionsService,
    private readonly tariffsService: TariffsService,
    private readonly userService: UserService,
    private readonly tinkoffPaymentsService: TinkoffPaymentsService,
    private readonly wazzupMessagingService: WazzupMessagingService,
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

  private parseTime(time: string): [number, number] {
    return time.split(':').map((el) => Number(el)) as [number, number];
  }

  async create(createTrainingDto: CreateTrainingDto, trainerId: number) {
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
        where: { id: In(createTrainingDto.client) },
        relations: {
          trainers: true,
          chatType: true,
        },
      });
    } else {
      clients = [
        await this.userService.findOne({
          where: { id: createTrainingDto.client[0] },
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

    // const [hours, minutes] = this.parseTime(tariff.duration);
    // const [startHours, startMin] = this.parseTime(createTrainingDto.startTime);
    //
    // const endTimeHours =
    //   startHours + hours + Math.floor((startMin + minutes) / 60);
    //
    // let endTimeMin =
    //   (startMin + minutes) % 60 == 0 ? '00' : (startMin + minutes) % 60;
    //
    // if (isNumber(endTimeMin) && endTimeMin < 10) {
    //   endTimeMin = `0${endTimeMin}`;
    // }

    const trainingsIds: number[] = [];

    for (const client of clients) {
      client.trainers.push({ id: trainerId } as UserEntity);

      await this.userService.save(client);

      const transaction = await this.transactionsService.save({
        client: { id: client.id },
        trainer: { id: trainerId },
        tariff: tariff,
        cost: tariff.clientsAmount
          ? tariff.cost / tariff.clientsAmount
          : tariff.cost,
        createdDate: new Date(),
      });

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
        messageTemplates['single-training-booking'](
          transaction.cost,
          paymentURL,
        ),
      );

      const training = await this.save({
        type: createTrainingDto.type
          ? { id: createTrainingDto.type }
          : undefined,
        slot: { id: createTrainingDto.slot },
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
        transaction: { tariff: true },
        type: true,
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
    trainingType?: number,
  ) {
    await Promise.all(
      createTrainingDtoArray.map(async (training) => {
        return await this.save({
          type: { id: trainingType },
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

  async cancelTraining(id: number): Promise<void> {
    const training = await this.findOne({
      where: { id: id },
      relations: { transaction: true },
    });

    await this.tinkoffPaymentsService.cancelOrRefundPayment(
      training.transaction.id,
    );
    await this.updateOne(training, { isCanceled: true });
  }

  async getTrainingsPerDay(trainerId: number, from?: string, to?: string) {
    const trainingsPerDay = (
      await this.trainingRepository
        .createQueryBuilder('training')
        .select([
          'DAY(training.`date`) as day',
          'MONTH(training.`date`) as month',
          'COUNT(training.`id`) as trainingCount',
        ])
        .where('training.trainer = :trainerId', { trainerId })
        .addGroupBy('DAY(training.`date`)')
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

    return trainingsPerDay;
  }
}
