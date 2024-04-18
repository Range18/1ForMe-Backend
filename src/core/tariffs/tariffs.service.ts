import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import EntityExceptions = AllExceptions.EntityExceptions;

@Injectable()
export class TariffsService extends BaseEntityService<
  Tariff,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(Tariff)
    private readonly tariffRepository: Repository<Tariff>,
  ) {
    super(
      tariffRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }
}
