import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { ApiHeader } from '@nestjs/swagger';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';

@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @User() user: UserRequest,
  ) {
    return await this.transactionsService.save({
      client: { id: createTransactionDto.client },
      sport: { id: createTransactionDto.sport },
      tariff: { id: createTransactionDto.tariff },
      customCost: createTransactionDto.customCost,
      trainer: { id: user.id },
    });
  }

  @Get()
  async findAll() {
    return await this.transactionsService.find({});
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.transactionsService.findOne({ where: { id: id } });
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.updateOne(
      { where: { id: id } },
       ,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.transactionsService.remove({ where: { id: id } });
  }
}
