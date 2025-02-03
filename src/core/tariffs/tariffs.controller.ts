import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
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

  // @AuthGuard()
  // @ApiCreatedResponse({ type: Tariff })
  // @Post('studios/:studioId/tariffs')
  // async create(
  //   @Body() body: CreateTariffDto,
  //   @User() user: UserRequest,
  //   @Param('studioId') studioId: number,
  // ) {
  //   return new GetTariffRdo(
  //     await this.tariffsService.save({
  //       ...body,
  //       category: { id: body.category },
  //       sport: { id: body.sport },
  //       studio: { id: studioId },
  //       type: { id: body.type },
  //     }),
  //   );
  // }

  @ApiQuery({ name: 'isForSubscription' })
  @ApiOkResponse({ type: [Tariff] })
  @Get('studios/byId/:studioId/tariffs')
  async getAllForStudio(
    @Param('studioId') studioId: number,
    @Query('isForSubscription')
    isForSubscription?: boolean,
  ) {
    const tariffs = await this.tariffsService.find({
      where: {
        isForSubscription: isForSubscription ? isForSubscription : undefined,
        studio: { id: studioId },
        isPublic: true,
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

  @ApiQuery({ name: 'isForSubscription' })
  @ApiOkResponse({ type: [Tariff] })
  @Get('studios/tariffs')
  async getAll(
    @Query('isForSubscription')
    isForSubscription?: boolean,
  ) {
    const tariffs = await this.tariffsService.find({
      where: {
        isForSubscription: isForSubscription ? isForSubscription : undefined,
        isPublic: true,
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
  @ApiQuery({ name: 'isForSubscription' })
  @Get('users/:userId/tariffs')
  async getAllForTrainerById(
    @Param('userId') userId: number,
    @Query('isForSubscription')
    isForSubscription?: boolean,
  ) {
    return await this.tariffsService.getAllForTrainer(
      userId,
      isForSubscription,
    );
  }

  @ApiOkResponse({ type: [Tariff] })
  @ApiQuery({ name: 'isForSubscription' })
  @AuthGuard()
  @Get('users/trainers/my/tariffs')
  async getAllForTrainer(
    @User() user: UserRequest,
    @Query() query: TariffQueryDto,
  ) {
    return await this.tariffsService.getAllForTrainer(
      user.id,
      query.isForSubscription,
    );
  }

  @ApiOkResponse({ type: Tariff })
  @Get('/tariffs/:id')
  async findOne(@Param('id') id: number) {
    return new GetTariffRdo(
      await this.tariffsService.findOne({
        where: { id, isPublic: true },
        relations: {
          studio: true,
          category: true,
          sport: true,
          type: true,
        },
      }),
    );
  }

  // // TODO PERMS
  // @ApiOkResponse({ type: Tariff })
  // @ApiBody({ type: UpdateTariffDto })
  // @Patch('/tariffs/:id')
  // async update(
  //   @Param('id') id: number,
  //   @Body() updateTariffDto: UpdateTariffDto,
  // ) {
  //   return new GetTariffRdo(
  //     await this.tariffsService.updateOne(
  //       {
  //         where: { id },
  //         relations: {
  //           studio: true,
  //           category: true,
  //           sport: true,
  //           type: true,
  //         },
  //       },
  //       {
  //         ...updateTariffDto,
  //         category: { id: updateTariffDto.category },
  //         sport: { id: updateTariffDto.sport },
  //       },
  //     ),
  //   );
  // }
}
