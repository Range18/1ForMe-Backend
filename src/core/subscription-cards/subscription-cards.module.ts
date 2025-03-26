import { Module } from '@nestjs/common';
import { SubscriptionCardsService } from './subscription-cards.service';
import { SubscriptionCardsController } from './subscription-cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionCard } from '#src/core/subscription-cards/entities/subscription-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionCard])],
  controllers: [SubscriptionCardsController],
  providers: [SubscriptionCardsService],
  exports: [SubscriptionCardsService],
})
export class SubscriptionCardsModule {}
