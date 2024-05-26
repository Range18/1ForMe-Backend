import { Module } from '@nestjs/common';
import { TransactionsModule } from '#src/core/transactions/transactions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TinkoffPaymentEntity } from '#src/core/tinkoff-payments/entities/tinkoff-payment.entity';
import { TinkoffPaymentsService } from '#src/core/tinkoff-payments/tinkoff-payments.service';
import { TinkoffPaymentsController } from '#src/core/tinkoff-payments/tinkoff-payments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TinkoffPaymentEntity]),
    TransactionsModule,
  ],
  providers: [TinkoffPaymentsService],
  controllers: [TinkoffPaymentsController],
  exports: [TinkoffPaymentsService],
})
export class TinkoffPaymentsModule {}
