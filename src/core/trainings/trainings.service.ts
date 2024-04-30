import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Training } from '#src/core/trainings/entities/training.entity';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { CreateTrainingDto } from '#src/core/trainings/dto/create-training.dto';
import { TransactionsService } from '#src/core/transactions/transactions.service';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
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

  async create(createTrainingDto: CreateTrainingDto, trainerId: number) {
    const tariff = createTrainingDto.createTransactionDto.tariff
      ? await this.tariffsService.findOne({
          where: { id: createTrainingDto.createTransactionDto.tariff },
        })
      : undefined;

    if (!tariff && !createTrainingDto.createTransactionDto.customCost) {
      throw new HttpException('No tariff or cost', HttpStatus.BAD_REQUEST);
    }

    const [hours, minutes] = createTrainingDto.duration
      .split(':')
      .map((el) => Number(el));

    const [startHours, startMin, startMil] = createTrainingDto.startTime
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
      club: { id: createTrainingDto.club },
      transaction: await this.transactionsService.save({
        client: { id: createTrainingDto.client },
        trainer: { id: trainerId },
        tariff: { id: createTrainingDto.createTransactionDto?.tariff },
        cost: createTrainingDto.createTransactionDto?.customCost ?? tariff.cost,
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
}
