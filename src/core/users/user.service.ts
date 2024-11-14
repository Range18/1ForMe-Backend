import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { UserEntity } from './entity/user.entity';
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

  async signUp(link: string, clientId: number) {
    const trainer = await this.findOne({
      where: { link: link },
      relations: { role: true, studios: true },
    });

    if (!trainer) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    const client = await this.findOne({
      where: { id: clientId },
      relations: { role: true, trainers: true },
    });

    if (!client) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    client.trainers.push(trainer);

    await Promise.all([await this.save(client), await this.save(trainer)]);
    return client;
  }
}
