import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { SubscriptionCard } from '#src/core/subscription-cards/entities/subscription-card.entity';
import { SubscriptionCardRdo } from '#src/core/subscription-cards/rdo/subscription-card.rdo';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import SubscriptionCardExceptions = AllExceptions.SubscriptionCardExceptions;

@Injectable()
export class SubscriptionCardsService extends BaseEntityService<
  SubscriptionCard,
  'SubscriptionCardExceptions',
  SubscriptionCardRdo
> {
  constructor(
    @InjectRepository(SubscriptionCard)
    private readonly subscriptionCardsRepository: Repository<SubscriptionCard>,
  ) {
    super(
      subscriptionCardsRepository,
      new ApiException(
        HttpStatus.NOT_FOUND,
        'SubscriptionCardExceptions',
        SubscriptionCardExceptions.NotFound,
      ),
      SubscriptionCardRdo,
    );
  }
}
