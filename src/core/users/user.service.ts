import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { UpdateTrainerDto } from '#src/core/users/dto/update-trainer.dto';
import { UpdateUserDto } from '#src/core/users/dto/update-user.dto';
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

  async updateTrainerWithChecks(userId: number, dto: UpdateTrainerDto) {
    await this.updateUserWithChecks(userId, dto);

    const userEntity = await this.findOne({
      where: { id: userId },
      relations: {
        role: true,
        avatar: true,
        studios: true,
        category: true,
        sports: true,
        chatType: true,
      },
    });

    if (dto.sports || dto.studios) {
      if (dto.sports) userEntity.sports = null;
      if (dto.studios) userEntity.studios = null;
      await this.save(userEntity);

      const studios = [];
      if (dto.studios) {
        for (const studio of dto.studios) {
          studios.push({ id: studio } as Studio);
        }
        userEntity.studios = studios;
      }

      const sports = [];
      if (dto.sports) {
        for (const sport of dto.sports) {
          sports.push({ id: sport } as Sport);
        }
        userEntity.sports = sports;
      }
    }

    return await this.updateOne(userEntity, {
      ...dto,
      isTrainerActive: dto.isActive,
      studios: [],
      category: { id: dto.category },
      sports: [],
      chatType: { id: dto.chatType },
    });
  }

  async updateUserWithChecks(userId: number, dto: UpdateUserDto) {
    const userEntity = await this.findOne({
      where: { id: userId },
      relations: {
        role: true,
        avatar: true,
        studios: true,
        category: true,
        sports: true,
        chatType: true,
        relatedComments: true,
      },
    });

    if (dto.phone) {
      const userWithSamePhone = await this.findOne(
        {
          where: { phone: dto.phone },
        },
        false,
      );

      if (userWithSamePhone && userEntity.id !== userWithSamePhone.id) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'UserExceptions',
          UserExceptions.UserAlreadyExists,
        );
      }
    }

    return await this.updateOne(userEntity, {
      ...dto,
      chatType: { id: dto.chatType },
    });
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
