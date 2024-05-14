import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { Between } from 'typeorm';
import { UpdateTransactionDto } from '#src/core/transactions/dto/update-transaction.dto';
import { GetAnalyticsRdo } from '#src/core/transactions/rdo/get-analytics.rdo';
import { GetTransactionSumsRdo } from '#src/core/transactions/rdo/get-transactions-sums.rdo';

@ApiTags('Transactions')
@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOkResponse({ type: [GetTransactionRdo] })
  @ApiQuery({ name: 'clientId' })
  @ApiQuery({ name: 'from' })
  @ApiQuery({ name: 'to' })
  @ApiQuery({ name: 'period' })
  @AuthGuard()
  @Get()
  async findAll(
    @User() user: UserRequest,
    @Query('clientId') clientId?: number,
    @Query('from') from?: Date,
    @Query('period') period?: string,
    @Query('to') to: Date = new Date(),
  ): Promise<GetTransactionRdo[]> {
    let dateRange = undefined;
    if (from == to) {
      dateRange = from;
    } else if (from) {
      dateRange = Between(from, to);
    }

    const transactions = await this.transactionsService.find({
      where: {
        client: clientId ? { id: clientId } : undefined,
        trainer: { id: user.id },
        createdAt: dateRange,
      },
      relations: {
        tariff: { sport: true, category: true },
        client: true,
        trainer: {
          avatar: true,
          category: true,
          studios: true,
        },
        training: { type: true },
        subscription: { trainings: { type: true, slot: true } },
      },
    });

    return transactions.map(
      (transaction) => new GetTransactionRdo(transaction),
    );
  }

  @ApiOkResponse({ type: GetAnalyticsRdo })
  @ApiQuery({ name: 'clientId' })
  @ApiQuery({ name: 'from' })
  @ApiQuery({ name: 'to' })
  @AuthGuard()
  @Get('/analytics/entities')
  async findAllAnalytics(
    @User() user: UserRequest,
    @Query('clientId') clientId?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<GetAnalyticsRdo[]> {
    return await this.transactionsService.getTransactionsPerDay(
      user.id,
      clientId,
      from,
      to,
    );
  }

  @ApiOkResponse({ type: GetTransactionRdo })
  @Get('byId/:id')
  async findOne(@Param('id') id: number) {
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
          training: true,
        },
      }),
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.updateOne(
      { where: { id: id } },
      { status: updateTransactionDto.status },
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.transactionsService.remove({ where: { id: id } });
  }

  @AuthGuard()
  @Get('analytics')
  async analytics(
    @User() user: UserRequest,
    @Query('from') from?: string,
    @Query('period') period?: string,
    @Query('to') to?: string,
  ): Promise<GetTransactionSumsRdo[]> {
    return await this.transactionsService.getAnalytics(
      user.id,
      from,
      period,
      to,
    );
  }
}
