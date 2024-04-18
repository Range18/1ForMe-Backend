import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import UserExceptions = AllExceptions.UserExceptions;

@Injectable()
export class UserService extends BaseEntityService<
  UserEntity,
  'UserExceptions'
> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super(
      userRepository,
      new ApiException<'UserExceptions'>(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      ),
    );
  }

  async signUp(link: string, clientId: number, isUserExists: boolean) {
    const coach = await this.findOne({
      where: { link: link },
      relations: { role: true, studio: true },
    });

    if (!coach) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    const client = await this.findOne({
      where: { id: clientId },
      relations: { role: true, studio: true },
    });

    //TODO
    if (isUserExists) {
      if (!client) {
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          'UserExceptions',
          UserExceptions.UserNotFound,
        );
      }
    } else {
    }
  }
}
