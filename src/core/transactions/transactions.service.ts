import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { GetTransactionSumsRdo } from '#src/core/transactions/rdo/get-transactions-sums.rdo';
import { SqlPeriodsEnum } from '#src/core/transactions/types/sql-periods.enum';
import { TransactionsByPeriodType } from '#src/core/transactions/types/transactions-by-period.type';
import { GetAnalyticsRdo } from '#src/core/transactions/rdo/get-analytics.rdo';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { UserService } from '#src/core/users/user.service';
import EntityExceptions = AllExceptions.EntityExceptions;

@Injectable()
export class TransactionsService extends BaseEntityService<
  Transaction,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(Transaction)
    readonly transactionRepository: Repository<Transaction>,
    private readonly userService: UserService,
  ) {
    super(
      transactionRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }

  async getAnalytics(
    trainerId: number,
    from?: string,
    period?: string,
    to?: string,
  ) {
    const trainer = await this.userService.findOne({
      where: { id: trainerId },
    });

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
    const totalByPeriodRaw = (
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

    if (
      from &&
      totalByPeriodRaw[0]?.date &&
      new Date(from) < new Date(totalByPeriodRaw[0]?.date)
    ) {
      const [year, month, date] = from.split('-');
      totalByPeriodRaw.unshift(
        new GetTransactionSumsRdo({
          costSum: 0,
          year: Number(year),
          month: Number(month),
          day: Number(date),
          date: date,
        }),
      );
    }

    let totalByPeriod: GetTransactionSumsRdo[] = [];

    if (totalByPeriodRaw.length > 1) {
      for (let i = 0; i < totalByPeriodRaw.length - 1; ++i) {
        totalByPeriod.push(totalByPeriodRaw[i]);
        let delta = 0;

        if (
          period == 'day' &&
          totalByPeriodRaw[i].month !== totalByPeriodRaw[i + 1].month
        ) {
          delta = Math.abs(
            totalByPeriodRaw[i][period] -
              (totalByPeriodRaw[i][period] - totalByPeriodRaw[i + 1][period]),
          );
        } else if (
          period == 'month' &&
          totalByPeriodRaw[i].year !== totalByPeriodRaw[i + 1].year
        ) {
          delta = Math.abs(
            totalByPeriodRaw[i][period] -
              (totalByPeriodRaw[i][period] - totalByPeriodRaw[i + 1][period]),
          );
        } else {
          delta = Math.abs(
            totalByPeriodRaw[i][period] - totalByPeriodRaw[i + 1][period],
          );
        }

        if (delta > 1) {
          for (let j = 0; j < delta - 1; ++j) {
            totalByPeriod.push(
              new GetTransactionSumsRdo({
                costSum: 0,
                year:
                  totalByPeriodRaw[i].month == 12
                    ? totalByPeriodRaw[i].year + 1
                    : totalByPeriodRaw[i].year,
                month:
                  period == 'month'
                    ? totalByPeriodRaw[i].month + j + 1
                    : totalByPeriodRaw[i].month,
                week:
                  period == 'week'
                    ? totalByPeriodRaw[i].week + j + 1
                    : undefined,
                day:
                  period == 'day' ? totalByPeriodRaw[i].day + j + 1 : undefined,
                date: undefined,
                // period == 'day'
                //   ? addTimeToStr(
                //       new Date(totalByPeriodRaw[i].date),
                //       24 * 60 * 60 * 1000 * (j + 1),
                //     )
                //   : undefined,
              }),
            );
          }
        }
      }
      totalByPeriod.push(totalByPeriodRaw.at(-1));
    } else {
      totalByPeriod = totalByPeriodRaw;
    }

    return totalByPeriod;
  }

  async getTransactionsPerDay(
    trainerId: number,
    clientId?: number,
    from?: string,
    to?: string,
  ) {
    const transactionsByPeriodRaw: TransactionsByPeriodType[] =
      await this.transactionRepository
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

    const transactionsByPeriod: GetAnalyticsRdo[] = [];

    for (const entity of transactionsByPeriodRaw) {
      const transactions = await this.transactionRepository.find({
        where: {
          id: In(entity.transactionsArray.split(',')),
        },
        relations: {
          client: true,
          tariff: { type: true },
          subscription: true,
          training: { slot: true },
        },
      });

      transactionsByPeriod.push({
        transactions: transactions.map(
          (transaction) => new GetTransactionRdo(transaction),
        ),
        day: entity.day,
        month: entity.month,
        totalCost: entity.costSum,
      });
    }

    return transactionsByPeriod;
  }
}
