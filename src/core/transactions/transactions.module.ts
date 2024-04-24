import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { SessionModule } from '#src/core/session/session.module';
import { UserModule } from '#src/core/users/user.module';
import { TokenModule } from '#src/core/token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, UserEntity, Sport, Tariff]),
    SessionModule,
    UserModule,
    TokenModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
