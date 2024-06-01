import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { UpdateTariffDto } from '#src/core/tariffs/dto/update-tariff.dto';
import { CreateTariffDto } from '#src/core/tariffs/dto/create-tariff.dto';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';
import { GetTariffRdo } from '#src/core/tariffs/rdo/get-tariff.rdo';
import { UserService } from '#src/core/users/user.service';

@ApiTags('Tariffs')
@Controller('api')
export class TariffsController {
  constructor(
    private readonly tariffsService: TariffsService,
    private readonly userService: UserService,
  ) {}

  @AuthGuard()
  @ApiCreatedResponse({ type: Tariff })
  @Post('studios/:studioId/tariffs')
  async create(
    @Body() body: CreateTariffDto,
    @User() user: UserRequest,
    @Param('studioId') studioId: number,
  ) {
    return new GetTariffRdo(
      await this.tariffsService.save({
        ...body,
        category: { id: body.category },
        sport: { id: body.sport },
        studio: { id: studioId },
      }),
    );
  }

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
      },
      relations: {
        studio: true,
        sport: true,
        category: true,
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
      },
      relations: {
        studio: true,
        sport: true,
        category: true,
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
    @Query('isForSubscription')
    isForSubscription?: boolean,
  ) {
    return await this.tariffsService.getAllForTrainer(
      user.id,
      isForSubscription,
    );
  }

  @ApiOkResponse({ type: Tariff })
  @Get('/tariffs/:id')
  async get(@Param('id') id: number) {
    return new GetTariffRdo(
      await this.tariffsService.findOne({
        where: { id },
        relations: {
          studio: true,
          category: true,
          sport: true,
        },
      }),
    );
  }

  // TODO PERMS
  @ApiOkResponse({ type: Tariff })
  @ApiBody({ type: UpdateTariffDto })
  @Patch('/tariffs/:id')
  async update(
    @Param('id') id: number,
    @Body() updateTariffDto: UpdateTariffDto,
  ) {
    return new GetTariffRdo(
      await this.tariffsService.updateOne(
        {
          where: { id },
          relations: {
            studio: true,
            category: true,
            sport: true,
          },
        },
        {
          ...updateTariffDto,
          category: { id: updateTariffDto.category },
          sport: { id: updateTariffDto.sport },
        },
      ),
    );
  }
}
