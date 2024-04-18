import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ApiException } from '#src/common/exception-handler/api-exception';
import RolesExceptions = AllExceptions.RolesExceptions;

@Injectable()
export class RolesService extends BaseEntityService<
  RolesEntity,
  'RolesExceptions'
> {
  constructor(
    @InjectRepository(RolesEntity)
    private readonly rolesRepository: Repository<RolesEntity>,
  ) {
    super(
      rolesRepository,
      new ApiException<'RolesExceptions'>(
        HttpStatus.NOT_FOUND,
        'RolesExceptions',
        RolesExceptions.NotFound,
      ),
    );
  }
}
