import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { Sport } from '#src/core/sports/entity/sports.entity';
import EntityExceptions = AllExceptions.EntityExceptions;

@Injectable()
export class SportsService extends BaseEntityService<
  Sport,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
  ) {
    super(
      sportRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }
}
