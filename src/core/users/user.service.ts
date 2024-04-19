import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { CreateClientDto } from '#src/core/users/dto/create-client.dto';
import { RolesService } from '#src/core/roles/roles.service';
import UserExceptions = AllExceptions.UserExceptions;

@Injectable()
export class UserService extends BaseEntityService<
  UserEntity,
  'UserExceptions'
> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly rolesService: RolesService,
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
      relations: { role: true, studio: true },
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

  async signUpByTrainer(createClientDto: CreateClientDto, trainerId: number) {
    const trainer = await this.findOne({ where: { id: trainerId } });

    if (!trainer) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    const clientExists = await this.findOne({
      where: { phone: createClientDto.phone },
    });

    if (clientExists) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'UserExceptions',
        UserExceptions.UserAlreadyExists,
      );
    }

    return await this.save({
      ...createClientDto,
      role: await this.rolesService.findOne({
        where: { name: createClientDto.role },
      }),
      trainers: [{ id: trainerId }],
    });
  }
}
