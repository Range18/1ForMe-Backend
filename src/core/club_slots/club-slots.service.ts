import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ClubSlots } from '#src/core/club_slots/entities/club-slot.entity';
import EntityExceptions = AllExceptions.EntityExceptions;

@Injectable()
export class ClubSlotsService extends BaseEntityService<
  ClubSlots,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(ClubSlots)
    private readonly clubsSlotsRepository: Repository<ClubSlots>,
  ) {
    super(
      clubsSlotsRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }
}
