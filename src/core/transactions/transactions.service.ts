import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { GetTransactionSumsRdo } from '#src/core/transactions/rdo/get-transactions-sums.rdo';
import { SqlPeriodsEnum } from '#src/core/transactions/types/sql-periods.enum';
import { GetAnalyticsRdo } from '#src/core/transactions/rdo/get-analytics.rdo';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { UserService } from '#src/core/users/user.service';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';
import TrainerExceptions = AllExceptions.TrainerExceptions;
import TransactionExceptions = AllExceptions.TransactionExceptions;

@Injectable()
export class TransactionsService extends BaseEntityService<
  Transaction,
  'TransactionExceptions'
> {
  constructor(
    @InjectRepository(Transaction)
    readonly transactionRepository: Repository<Transaction>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {
    super(
      transactionRepository,
      new ApiException<'TransactionExceptions'>(
        HttpStatus.NOT_FOUND,
        'TransactionExceptions',
        TransactionExceptions.NotFound,
      ),
    );
  }

  async getTrainerTransactionSumsByTimeUnit(
    trainerId: number,
    from?: string,
    period?: string,
    to?: string,
  ) {
    const trainer = await this.userService.findOne({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'TrainerExceptions',
        TrainerExceptions.NotFound,
      );
    }

    const selectQuery = [
      `YEAR(COALESCE(training.date, subTrainings.firstTrainingDate)) as year`,
      `MONTH(COALESCE(training.date, subTrainings.firstTrainingDate)) as month`,
      `SUM(transaction.cost) as costSum`,
      `COALESCE(training.date, subTrainings.firstTrainingDate) as date`,
    ];

    if (period !== 'month') {
      selectQuery.push(
        `WEEK(COALESCE(training.date, subTrainings.firstTrainingDate), 1) as week`,
      );
      if (period !== 'week') {
        selectQuery.push(
          `DAY(COALESCE(training.date, subTrainings.firstTrainingDate)) as day`,
        );
      }
    }

    return (
      await this.transactionRepository
        .createQueryBuilder('transaction')
        .leftJoin('transaction.training', 'training') // Привязываем индивидуальные тренировки
        .leftJoin('transaction.subscription', 'subscription') // Привязываем подписки
        .leftJoin(
          // Подзапрос для минимальной даты тренировки, связанной с подпиской
          (qb) =>
            qb
              .select('training.subscription.id', 'subscriptionId') // Связь тренировок с подпиской
              .addSelect('MIN(training.date)', 'firstTrainingDate') // Находим минимальную дату
              .from('training', 'training') // Работаем с таблицей тренировок
              .where('training.subscription.id IS NOT NULL') // Только тренировки, привязанные к подпискам
              .groupBy('training.subscription.id'), // Группируем по подписке
          'subTrainings',
          'subscription.id = subTrainings.subscriptionId', // Привязываем подзапрос к основной подписке
        )
        .select(selectQuery)
        .where(`transaction.trainer.id = :trainerId`, { trainerId: trainerId })
        .andWhere('transaction.status = :status', { status: 'Paid' }) // Только оплаченные транзакции
        .groupBy(
          `YEAR(COALESCE(training.date, subTrainings.firstTrainingDate))`,
        ) // Группируем по году
        .addGroupBy(period ? SqlPeriodsEnum[period] : SqlPeriodsEnum.day) // Группируем по периоду
        .addOrderBy(
          `COALESCE(training.date, subTrainings.firstTrainingDate)`,
          'ASC',
        ) // Сортируем по дате
        .getRawMany()
    ).map((entity) => new GetTransactionSumsRdo(entity, trainer.tax));
  }

  async getAnalytics(
    trainerId: number,
    from?: string,
    period?: string,
    to?: string,
  ) {
    const transactionSumsPerTimeUnit =
      await this.getTrainerTransactionSumsByTimeUnit(
        trainerId,
        from,
        period,
        to,
      );

    const periodSums = [];

    for (const periodSum of transactionSumsPerTimeUnit) {
      periodSums.push(periodSum);
    }
    return periodSums;
  }

  async getTransactionsPerDayRaw(
    trainerId: number,
    clientId?: number,
    from?: string,
    to?: string,
  ) {
    let query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.training', 'training') // Привязываем индивидуальные тренировки
      .leftJoin('transaction.subscription', 'subscription') // Привязываем подписки
      .leftJoin(
        // Подзапрос для минимальной даты тренировки, связанной с подпиской
        (qb) =>
          qb
            .select('training.subscription.id', 'subscriptionId') // Связь тренировок с подпиской
            .addSelect('MIN(training.date)', 'firstTrainingDate') // Находим минимальную дату
            .from('training', 'training') // Работаем с таблицей тренировок
            .where('training.subscription.id IS NOT NULL') // Только тренировки, привязанные к подпискам
            .groupBy('training.subscription.id'), // Группируем по подписке
        'subTrainings',
        'subscription.id = subTrainings.subscriptionId', // Привязываем подзапрос к основной подписке
      )
      .select([
        'MONTH(COALESCE(training.date, subTrainings.firstTrainingDate)) as month',
        'DAY(COALESCE(training.date, subTrainings.firstTrainingDate)) as day',
        'SUM(cost) as costSum',
        'GROUP_CONCAT(transaction.id) as transactionsArray',
      ])
      .where(`transaction.trainer.id = :trainerId`, { trainerId: trainerId })
      .andWhere('transaction.status = :status', { status: 'Paid' }) // Только оплаченные транзакции
      .groupBy(`YEAR(COALESCE(training.date, subTrainings.firstTrainingDate))`) // Группируем по году
      .addGroupBy(
        'MONTH(COALESCE(training.date, subTrainings.firstTrainingDate)), DAY(COALESCE(training.date, subTrainings.firstTrainingDate))',
      ) // Группируем по периоду
      .addOrderBy(
        `COALESCE(training.date, subTrainings.firstTrainingDate)`,
        'DESC',
      ); // Сортируем по дате

    if (from) {
      query = query.andWhere(
        'training.date >= COALESCE(CAST(:from AS DATE), training.date)',
        { from: from },
      );
    }

    if (to) {
      query = query.andWhere(
        'training.date <= COALESCE(CAST(:to AS DATE), training.date)',
        {
          to: to,
        },
      );
    }

    if (clientId) {
      query = query.andWhere(
        'transaction.client = COALESCE(:clientId, transaction.client)',
        { clientId: clientId },
      );
    }

    return await query.getRawMany();
  }

  async getTransactionsPerDay(
    trainerId: number,
    clientId?: number,
    from?: string,
    to?: string,
  ) {
    const transactionsPerDayRaw = await this.getTransactionsPerDayRaw(
      trainerId,
      clientId,
      from,
      to,
    );

    const transactionsPerDay: GetAnalyticsRdo[] = [];

    for (const entry of transactionsPerDayRaw) {
      const transactions = await this.transactionRepository.find({
        where: {
          id: In(entry.transactionsArray.split(',')),
        },
        relations: {
          client: true,
          tariff: { type: true },
          subscription: true,
          training: { slot: true },
        },
      });

      transactionsPerDay.push({
        transactions: transactions.map(
          (transaction) => new GetTransactionRdo(transaction),
        ),
        day: entry.day,
        month: entry.month,
        totalCost: entry.costSum,
      });
    }

    return transactionsPerDay;
  }

  async updateExpiredAndCreteNew(expiredTransactionId: number) {
    const expiredTransaction = await this.findOne({
      where: { id: expiredTransactionId },
      relations: {
        client: true,
        subscription: true,
        tariff: true,
        training: true,
        trainer: true,
      },
    });

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let newTransaction: Transaction;
    try {
      const { id } = await queryRunner.manager.save(Transaction, {
        client: expiredTransaction.client,
        training: expiredTransaction.training,
        subscription: expiredTransaction.subscription,
        tariff: expiredTransaction.tariff,
        cost: expiredTransaction.cost,
        paidVia: expiredTransaction.paidVia,
        trainer: expiredTransaction.trainer,
        createdDate: new Date(),
      });

      expiredTransaction.training = null;
      expiredTransaction.subscription = null;
      expiredTransaction.status = TransactionStatus.Expired;
      await queryRunner.manager.save(expiredTransaction);

      newTransaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: id },
        relations: {
          client: true,
          training: true,
          tariff: true,
          subscription: true,
          trainer: true,
        },
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return newTransaction;
  }
}
