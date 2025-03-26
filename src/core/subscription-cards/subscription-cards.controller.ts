import { Controller, Get, Param } from '@nestjs/common';
import { SubscriptionCardsService } from './subscription-cards.service';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionCardRdo } from '#src/core/subscription-cards/rdo/subscription-card.rdo';

@ApiTags('Subscription cards')
@Controller('api/subscription-cards')
export class SubscriptionCardsController {
  constructor(
    private readonly subscriptionCardsService: SubscriptionCardsService,
  ) {}

  @Get()
  async findAll(): Promise<SubscriptionCardRdo[]> {
    return this.subscriptionCardsService.formatToDto(
      await this.subscriptionCardsService.find({}),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SubscriptionCardRdo> {
    return this.subscriptionCardsService.formatToDto(
      await this.subscriptionCardsService.findOne({ where: { id } }),
    );
  }
}
