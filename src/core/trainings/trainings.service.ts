import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Training } from '#src/core/trainings/entities/training.entity';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { CreateTrainingDto } from '#src/core/trainings/dto/create-training.dto';
import { TransactionsService } from '#src/core/transactions/transactions.service';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { isNumber } from 'class-validator';
import EntityExceptions = AllExceptions.EntityExceptions;

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

    const [hours, minutes] = this.parseTime(createTrainingDto.duration);
    const [startHours, startMin] = this.parseTime(createTrainingDto.startTime);

    const endTimeHours =
      startHours + hours + Math.floor((startMin + minutes) / 60);

    let endTimeMin =
      (startMin + minutes) % 60 == 0 ? '00' : (startMin + minutes) % 60;

    if (isNumber(endTimeMin) && endTimeMin < 10) {
      endTimeMin = `0${endTimeMin}`;
    }

    const training = await this.save({
      sport: { id: createTrainingDto.sport },
      status: createTrainingDto.status,
      type: { id: createTrainingDto.type },
      date: createTrainingDto.date,
      startTime: createTrainingDto.startTime,
      client: { id: createTrainingDto.client },
      trainer: { id: trainerId },
      duration: createTrainingDto.duration,
      endTime: `${endTimeHours}:${endTimeMin}`,
      club: { id: createTrainingDto.club },
      transaction: await this.transactionsService.save({
        client: { id: createTrainingDto.client },
        trainer: { id: trainerId },
        tariff: tariff,
        cost: tariff.cost,
      }),
    });

    return await this.findOne({
      where: { id: training.id },
      relations: {
        client: { avatar: true },
        trainer: { avatar: true },
        transaction: { tariff: true },
        sport: true,
        type: true,
        club: { city: true },
      },
    });
  }

  async createForSubscription(
    createTrainingDtoArray: Omit<CreateTrainingDto, 'createTransactionDto'>[],
    trainerId: number,
    subscriptionEntity: Subscription,
  ) {
    await Promise.all(
      createTrainingDtoArray.map(async (training) => {
        const [hours, minutes] = this.parseTime(training.duration);
        const [startHours, startMin] = this.parseTime(training.startTime);

        const endTimeHours =
          startHours + hours + Math.floor((startMin + minutes) / 60);

        let endTimeMin =
          (startMin + minutes) % 60 == 0 ? '00' : (startMin + minutes) % 60;

        if (isNumber(endTimeMin) && endTimeMin < 10) {
          endTimeMin = `0${endTimeMin}`;
        }

        return await this.save({
          sport: { id: training.sport },
          status: training.status,
          type: { id: training.type },
          date: training.date,
          startTime: training.startTime,
          client: { id: training.client },
          trainer: { id: trainerId },
          duration: training.duration,
          endTime: `${endTimeHours}:${endTimeMin}`,
          club: { id: training.club },
          subscription: subscriptionEntity,
        });
      }),
    );
  }
}
