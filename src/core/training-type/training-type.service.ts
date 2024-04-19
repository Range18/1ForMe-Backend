import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';
import EntityExceptions = AllExceptions.EntityExceptions;

@Injectable()
export class TrainingTypeService extends BaseEntityService<
  TrainingType,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(TrainingType)
    private readonly trainingTypeRepository: Repository<TrainingType>,
  ) {
    super(
      trainingTypeRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }
}
