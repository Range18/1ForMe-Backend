import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { City } from '#src/core/city/entity/cities.entity';
import EntityExceptions = AllExceptions.EntityExceptions;

@Injectable()
export class CitiesService extends BaseEntityService<City, 'EntityExceptions'> {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {
    super(
      cityRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }
}
