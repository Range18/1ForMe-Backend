import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { Repository } from 'typeorm';
import { BaseEntityService } from '#src/common/base-entity.service';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import StudioExceptions = AllExceptions.StudioExceptions;

@Injectable()
export class StudiosService extends BaseEntityService<
  Studio,
  'StudioExceptions'
> {
  constructor(
    @InjectRepository(Studio)
    private readonly studioRepository: Repository<Studio>,
  ) {
    super(
      studioRepository,
      new ApiException<'StudioExceptions'>(
        HttpStatus.NOT_FOUND,
        'StudioExceptions',
        StudioExceptions.NotFound,
      ),
    );
  }
}
