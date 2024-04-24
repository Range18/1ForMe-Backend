import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Training } from '#src/core/trainings/entities/training.entity';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { CreateTrainingDto } from '#src/core/trainings/dto/create-training.dto';
import { TransactionsService } from '#src/core/transactions/transactions.service';
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

  async create(createTrainingDto: CreateTrainingDto, trainerId: number) {
    const [hours, minutes] = createTrainingDto.duration
      .split(':')
      .map((el) => Number(el));
    const [date, time] = createTrainingDto.startTime.toString().split('T');

    const [startHours, startMin, startMil] = time
      .split(':')
      .map((el) => Number(el));

    const training = await this.save({
      sport: { id: createTrainingDto.sport },
      status: createTrainingDto.status,
      type: { id: createTrainingDto.type },
      date: createTrainingDto.date,
      startTime: createTrainingDto.startTime,
      client: { id: createTrainingDto.client },
      trainer: { id: trainerId },
      duration: createTrainingDto.duration,
      endTime: `${startHours + hours + Math.floor((startMin + minutes) / 60)}:${
        (startMin + minutes) % 60 == 0 ? '00' : (startMin + minutes) % 60
      }`,
      transaction: await this.transactionsService.save({
        client: { id: createTrainingDto.client },
        trainer: { id: trainerId },
        tariff: { id: createTrainingDto.createTransactionDto.tariff },
        customCost: createTrainingDto.createTransactionDto.customCost,
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
      },
    });
  }
}
