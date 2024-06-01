import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Slot } from '#src/core/trainer-slots/entities/slot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import EntityExceptions = AllExceptions.EntityExceptions;

@Injectable()
export class SlotsService extends BaseEntityService<Slot, 'EntityExceptions'> {
  constructor(
    @InjectRepository(Slot) private readonly slotsRepository: Repository<Slot>,
  ) {
    super(
      slotsRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }
}
