import { Controller, Get, Param } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { ApiTags } from '@nestjs/swagger';
import { GiftCardRdo } from '#src/core/gift-cards/rdo/gift-card.rdo';

@ApiTags('Gift cards')
@Controller('gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  @Get()
  async findAll(): Promise<GiftCardRdo[]> {
    return this.giftCardsService.formatToDto(
      await this.giftCardsService.find({}),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GiftCardRdo> {
    return this.giftCardsService.formatToDto(
      await this.giftCardsService.findOne({ where: { id } }),
    );
  }
}
