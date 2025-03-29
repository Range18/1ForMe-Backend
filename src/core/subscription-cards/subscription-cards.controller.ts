import { Controller, Get, Param, Query } from '@nestjs/common';
import { SubscriptionCardsService } from './subscription-cards.service';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionCardRdo } from '#src/core/subscription-cards/rdo/subscription-card.rdo';
import { SubscriptionCardQueryDto } from '#src/core/subscription-cards/dto/subscription-card-query.dto';

@ApiTags('Subscription cards')
@Controller('api/subscription-cards')
export class SubscriptionCardsController {
  constructor(
    private readonly subscriptionCardsService: SubscriptionCardsService,
  ) {}

  @Get()
  async findAll(
    @Query() query: SubscriptionCardQueryDto,
  ): Promise<SubscriptionCardRdo[]> {
    return this.subscriptionCardsService.formatToDto(
      await this.subscriptionCardsService.find({
        where: {
          tariff: {
            category: { id: query.TrainerCategoryId },
            type: { id: query.trainingTypeId },
          },
        },
      }),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SubscriptionCardRdo> {
    return this.subscriptionCardsService.formatToDto(
      await this.subscriptionCardsService.findOne({ where: { id } }),
    );
  }
}
