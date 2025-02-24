import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { GiftCard } from '#src/core/gift-cards/entities/gift-card.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { GiftCardRdo } from '#src/core/gift-cards/rdo/gift-card.rdo';
import GiftCardExceptions = AllExceptions.GiftCardExceptions;

@Injectable()
export class GiftCardsService extends BaseEntityService<
  GiftCard,
  'GiftCardExceptions',
  GiftCardRdo
> {
  constructor(
    @InjectRepository(GiftCard)
    private readonly giftCardsRepository: Repository<GiftCard>,
  ) {
    super(
      giftCardsRepository,
      new ApiException(
        HttpStatus.NOT_FOUND,
        'GiftCardExceptions',
        GiftCardExceptions.NotFound,
      ),
      GiftCardRdo,
    );
  }
}
