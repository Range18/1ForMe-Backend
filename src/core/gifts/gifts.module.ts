import { Module } from '@nestjs/common';
import { GiftsService } from './gifts.service';
import { GiftsController } from './gifts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gift } from '#src/core/gifts/entities/gift.entity';
import { TinkoffPaymentsModule } from '#src/core/tinkoff-payments/tinkoff-payments.module';
import { TransactionsModule } from '#src/core/transactions/transactions.module';
import { UserModule } from '#src/core/users/user.module';
import { GiftCardsModule } from '#src/core/gift-cards/gift-cards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gift]),
    UserModule,
    TransactionsModule,
    TinkoffPaymentsModule,
    GiftCardsModule,
  ],
  controllers: [GiftsController],
  providers: [GiftsService],
  exports: [GiftsService],
})
export class GiftsModule {}
