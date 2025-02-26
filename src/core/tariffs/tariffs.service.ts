import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { GetTariffRdo } from '#src/core/tariffs/rdo/get-tariff.rdo';
import { UserService } from '#src/core/users/user.service';
import { TariffQueryDto } from '#src/core/tariffs/dto/tariff-query.dto';
import EntityExceptions = AllExceptions.EntityExceptions;
import UserExceptions = AllExceptions.UserExceptions;
import TrainerExceptions = AllExceptions.TrainerExceptions;

@Injectable()
export class TariffsService extends BaseEntityService<
  Tariff,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(Tariff)
    private readonly tariffRepository: Repository<Tariff>,
    private readonly userService: UserService,
  ) {
    super(
      tariffRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }

  async getAllForTrainer(trainerId: number, query: TariffQueryDto) {
    const trainer = await this.userService.findOne({
      where: { id: trainerId },
      relations: { studios: true, category: true },
    });

    if (!trainer) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    if (!trainer.category) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'TrainerExceptions',
        TrainerExceptions.WithoutCategory,
      );
    }

    const studioIdsOrClubId = query.clubId
      ? []
      : trainer.studios.map((studio) => studio.id);

    const tariffs = await this.find({
      where: {
        studio: query.clubId ? undefined : { id: In(studioIdsOrClubId) },
        clubs: query.clubId ? { id: query.clubId } : undefined,
        category: { id: trainer.category.id },
        isForSubscription: query.isForSubscription,
        isPublic: query.isPublic,
      },
      relations: {
        studio: true,
        category: true,
        sport: true,
        type: true,
      },
    });

    return tariffs.map((entity) => new GetTariffRdo(entity));
  }
}
