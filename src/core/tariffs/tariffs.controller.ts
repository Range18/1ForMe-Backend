import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';
import { GetTariffRdo } from '#src/core/tariffs/rdo/get-tariff.rdo';
import { TariffQueryDto } from '#src/core/tariffs/dto/tariff-query.dto';

@ApiTags('Tariffs')
@Controller('api')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @ApiOkResponse({ type: [Tariff] })
  @Get('studios/tariffs')
  async getAll(@Query() query: TariffQueryDto) {
    const tariffs = await this.tariffsService.find({
      where: {
        isForSubscription: query.isForSubscription,
        isPublic: query.isPublic,
        studio: { city: query.city ? { name: query.city } : undefined },
      },
      relations: {
        studio: true,
        sport: true,
        category: true,
        type: true,
      },
    });

    return tariffs.map((entity) => new GetTariffRdo(entity));
  }

  @ApiOkResponse({ type: [Tariff] })
  @Get('studios/byId/:studioId/tariffs')
  async getAllForStudio(
    @Param('studioId') studioId: number,
    @Query() query: TariffQueryDto,
  ) {
    const tariffs = await this.tariffsService.find({
      where: {
        isForSubscription: query.isForSubscription,
        studio: { id: studioId },
        isPublic: query.isPublic,
      },
      relations: {
        studio: true,
        sport: true,
        category: true,
        type: true,
      },
    });

    return tariffs.map((entity) => new GetTariffRdo(entity));
  }

  @ApiOkResponse({ type: [Tariff] })
  @Get('users/:userId/tariffs')
  async getAllForTrainerById(
    @Param('userId') userId: number,
    @Query() query: TariffQueryDto,
  ) {
    return await this.tariffsService.getAllForTrainer(userId, query);
  }

  @ApiOkResponse({ type: [Tariff] })
  @AuthGuard()
  @Get('users/trainers/my/tariffs')
  async getAllForTrainer(
    @User() user: UserRequest,
    @Query() query: TariffQueryDto,
  ) {
    return await this.tariffsService.getAllForTrainer(user.id, query);
  }

  @ApiOkResponse({ type: Tariff })
  @Get('/tariffs/:id')
  async findOne(@Param('id') id: number) {
    return new GetTariffRdo(
      await this.tariffsService.findOne({
        where: { id },
        relations: {
          studio: true,
          category: true,
          sport: true,
          type: true,
        },
      }),
    );
  }
}
