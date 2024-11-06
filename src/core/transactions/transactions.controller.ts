import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { ApiTags } from '@nestjs/swagger';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { Between } from 'typeorm';
import { UpdateTransactionDto } from '#src/core/transactions/dto/update-transaction.dto';
import { GetAnalyticsRdo } from '#src/core/transactions/rdo/get-analytics.rdo';
import { GetTransactionSumsRdo } from '#src/core/transactions/rdo/get-transactions-sums.rdo';
import { RolesGuard } from '#src/common/decorators/guards/roles-guard.decorator';
import { TransactionsPerDayQuery } from '#src/core/transactions/dto/transactions-per-day.query';
import { TransactionsSumsPerTimeUnitQuery } from '#src/core/transactions/dto/transactions-sums-per-timeUnit.query';
import { TransactionQuery } from '#src/core/transactions/dto/transaction.query';

@ApiTags('Transactions')
@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @AuthGuard()
  @Get()
  async findAll(
    @User() user: UserRequest,
    @Query() query: TransactionQuery,
  ): Promise<GetTransactionRdo[]> {
    const transactions = await this.transactionsService.find({
      where: {
        client: query.clientId ? { id: query.clientId } : undefined,
        trainer: { id: user.id },
        createdAt: query.from ? Between(query.from, query.to) : undefined,
      },
      relations: {
        tariff: { type: true, sport: true, category: true },
        client: true,
        trainer: {
          avatar: true,
          category: true,
          studios: true,
        },
        training: { slot: true },
        subscription: { trainings: { slot: true } },
      },
    });

    return transactions.map(
      (transaction) => new GetTransactionRdo(transaction),
    );
  }

  @AuthGuard()
  @Get('analytics')
  async analytics(
    @User() user: UserRequest,
    @Query() query: TransactionsSumsPerTimeUnitQuery,
  ): Promise<GetTransactionSumsRdo[]> {
    return await this.transactionsService.getAnalytics(
      user.id,
      query.from,
      query.period,
      query.to,
    );
  }

  @AuthGuard()
  @Get('/analytics/entities')
  async findAllAnalytics(
    @User() user: UserRequest,
    @Query() query: TransactionsPerDayQuery,
  ): Promise<GetAnalyticsRdo[]> {
    return await this.transactionsService.getTransactionsPerDay(
      user.id,
      query.clientId,
      query.from,
      query.to,
    );
  }

  @Get('byId/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return new GetTransactionRdo(
      await this.transactionsService.findOne({
        where: { id: id },
        relations: {
          tariff: true,
          client: { avatar: true },
          trainer: {
            avatar: true,
            category: true,
            studios: true,
          },
          training: {
            slot: true,
          },
        },
      }),
    );
  }

  @RolesGuard('trainer', 'admin')
  @AuthGuard()
  @Patch(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.updateOne(
      { where: { id: id } },
      {
        status: updateTransactionDto.status,
        paidVia: updateTransactionDto.paidVia,
      },
    );
  }
}
