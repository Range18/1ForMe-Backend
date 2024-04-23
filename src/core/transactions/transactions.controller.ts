import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { GetTransactionRdo } from '#src/core/transactions/rdo/get-transaction.rdo';
import { Between } from 'typeorm';
import { UpdateTransactionDto } from '#src/core/transactions/dto/update-transaction.dto';

@ApiTags('Transactions')
@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiHeader({ name: 'Authorization' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiCreatedResponse({ type: GetTransactionRdo })
  @AuthGuard()
  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @User() user: UserRequest,
  ) {
    const transaction = await this.transactionsService.save({
      client: { id: createTransactionDto.client },
      sport: { id: createTransactionDto.sport },
      tariff: { id: createTransactionDto.tariff },
      customCost: createTransactionDto.customCost,
      trainer: { id: user.id },
    });

    return new GetTransactionRdo(
      await this.transactionsService.findOne({
        where: { id: transaction.id },
        relations: {
          tariff: true,
          client: { avatar: true },
          trainer: {
            avatar: true,
            category: true,
            studio: true,
          },
          sport: true,
        },
      }),
    );
  }

  @ApiOkResponse({ type: [GetTransactionRdo] })
  @ApiQuery({ name: 'from' })
  @ApiQuery({ name: 'to' })
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Get()
  async findAll(
    @User() user: UserRequest,
    @Query('from') from?: Date,
    @Query('to') to: Date = new Date(),
  ) {
    let dateRange = undefined;
    if (from == to) {
      dateRange = from;
    } else if (from) {
      dateRange = Between(from, to);
    }

    const transactions = await this.transactionsService.find({
      where: {
        trainer: { id: user.id },
        createdAt: dateRange,
      },
      relations: {
        tariff: true,
        client: { avatar: true },
        trainer: {
          avatar: true,
          category: true,
          studio: true,
        },
        sport: true,
      },
    });

    return transactions.map(
      (transaction) => new GetTransactionRdo(transaction),
    );
  }
  @ApiOkResponse({ type: GetTransactionRdo })
  @Get(':id')
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
            studio: true,
          },
          sport: true,
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
}