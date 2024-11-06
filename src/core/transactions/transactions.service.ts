import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { GetTransactionSumsRdo } from '#src/core/transactions/rdo/get-transactions-sums.rdo';
import { SqlPeriodsEnum } from '#src/core/transactions/types/sql-periods.enum';
import { GetAnalyticsRdo } from '#src/core/transactions/rdo/get-analytics.rdo';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { UserService } from '#src/core/users/user.service';
import { getDateRange } from '#src/common/utilities/date-range.func';
import { getWeek } from '#src/common/utilities/get-week.func';
import { DaysEnum } from '#src/core/transactions/types/days.enum';
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
      'MONTH(createdAt) as month',
      'YEAR(createdAt) as year',
      'SUM(cost) as costSum',
    ];

    if (period != 'month') {
      selectQuery.push('WEEK(createdAt,1) as week');
      if (period != 'week') {
        selectQuery.push('DAY(createdAt) as day');
        selectQuery.push('DATE(createdAt) as date');
      }
    }

    return (
      await this.transactionRepository
        .createQueryBuilder('transaction')
        .select(selectQuery)
        .where(`transaction.trainer.id = :trainerId`, { trainerId: trainerId })
        .andWhere(
          'transaction.createdAt >= COALESCE(CAST(:from AS DATE), transaction.createdAt)',
          { from: from ?? undefined },
        )
        .andWhere(
          'transaction.createdAt <= COALESCE(CAST(:to AS DATE), transaction.createdAt)',
          { to: to ?? undefined },
        )
        .andWhere('transaction.status = :status', { status: 'Paid' })
        .addGroupBy('YEAR(createdAt)')
        .addGroupBy(period ? SqlPeriodsEnum[period] : SqlPeriodsEnum.day)
        .addOrderBy('createdAt', 'ASC')
        .getRawMany()
    ).map((entity) => new GetTransactionSumsRdo(entity, trainer.tax));
  }

  private getDaysRange(
    timeUnit: GetTransactionSumsRdo,
    nextTimeUnit: GetTransactionSumsRdo,
    period?: string,
  ) {
    if (period == 'day' && timeUnit.month !== nextTimeUnit.month) {
      return Math.abs(timeUnit.day - (timeUnit.day - nextTimeUnit.day));
    } else if (period == 'month' && timeUnit.year !== nextTimeUnit.year) {
      return Math.abs(timeUnit.month - (timeUnit.month - nextTimeUnit.month));
    }
    return Math.abs(timeUnit[period] - nextTimeUnit[period]);
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

    if (
      from &&
      transactionSumsPerTimeUnit[0]?.date &&
      new Date(from) < new Date(transactionSumsPerTimeUnit[0]?.date)
    ) {
      const [year, month, date] = from.split('-');
      transactionSumsPerTimeUnit.unshift(
        new GetTransactionSumsRdo({
          costSum: 0,
          year: Number(year),
          month: Number(month),
          day: Number(date),
          date: new Date(from).toISOString(),
        }),
      );
    }

    if (transactionSumsPerTimeUnit.length <= 1)
      return transactionSumsPerTimeUnit;

    const transactionSumsWithTabs: GetTransactionSumsRdo[] = [];
    for (let i = 0; i < transactionSumsPerTimeUnit.length - 1; ++i) {
      const transactionSum = transactionSumsPerTimeUnit[i];
      const nextTransactionSum = transactionSumsPerTimeUnit[i + 1];

      transactionSumsWithTabs.push(transactionSum);
      const daysRangeAmount = this.getDaysRange(
        transactionSum,
        nextTransactionSum,
        period,
      );

      if (daysRangeAmount <= 1) continue;

      const startDate = new Date(
        transactionSum.date.split('.').reverse().join('-'),
      );
      startDate.setDate(startDate.getDate() + 1);
      const datesRange = getDateRange(startDate, daysRangeAmount, 1);

      for (const date of datesRange) {
        const [year, month, week, day] = [
          date.getFullYear(),
          date.getMonth() + 1,
          getWeek(date, DaysEnum.Monday),
          date.getDate(),
        ];
        transactionSumsWithTabs.push(
          new GetTransactionSumsRdo({
            costSum: 0,
            day,
            week,
            month,
            year,
            date: date.toISOString(),
          }),
        );
      }
    }
    transactionSumsWithTabs.push(transactionSumsPerTimeUnit.at(-1));
    return transactionSumsWithTabs;
  }

  async getTransactionsPerDayRaw(
    trainerId: number,
    clientId?: number,
    from?: string,
    to?: string,
  ) {
    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .select([
        'MONTH(createdDate) as month',
        'DAY(createdDate) as day',
        'SUM(cost) as costSum',
        'GROUP_CONCAT(id) as transactionsArray',
      ])
      .where(`transaction.trainer.id = :trainerId`, { trainerId: trainerId })
      .andWhere(
        'transaction.createdAt >= COALESCE(CAST(:from AS DATE), transaction.createdAt)',
        { from: from ?? undefined },
      )
      .andWhere(
        'transaction.createdAt <= COALESCE(CAST(:to AS DATE), transaction.createdAt)',
        { to: to ?? undefined },
      )
      .andWhere(
        'transaction.client = COALESCE(:clientId, transaction.client)',
        { clientId: clientId ?? undefined },
      )
      .andWhere('transaction.status = :status', { status: 'Paid' })
      .addGroupBy('createdDate')
      .addOrderBy('createdDate', 'ASC')
      .getRawMany();
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
}
