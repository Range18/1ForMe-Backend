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
  ApiHeader,
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

@ApiTags('Tariffs')
@Controller('api/users/trainers')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @ApiCreatedResponse({ type: Tariff })
  @Post('/tariffs')
  async create(@Body() body: CreateTariffDto, @User() user: UserRequest) {
    return new GetTariffRdo(
      await this.tariffsService.save({
        ...body,
        sport: { id: body.sport },
        user: { id: user.id },
      }),
    );
  }

  @ApiQuery({ name: 'isForSubscription' })
  @ApiOkResponse({ type: [Tariff] })
  @Get('/tariffs')
  async getAll(@Query('isForSubscription') isForSubscription?: boolean) {
    const tariffs = await this.tariffsService.find({
      where: {
        isForSubscription: isForSubscription ? isForSubscription : undefined,
      },
      relations: {
        user: {
          studio: { city: true },
          role: true,
          avatar: true,
          category: true,
        },
      },
    });

    return tariffs.map((entity) => new GetTariffRdo(entity));
  }

  @ApiOkResponse({ type: [Tariff] })
  @Get(':id/tariffs')
  async getAllForTrainer(@Param('id') id: number) {
    const tariffs = await this.tariffsService.find({
      where: { user: { id: id } },
      relations: {
        user: {
          studio: { city: true },
          role: true,
          avatar: true,
          category: true,
        },
      },
    });

    return tariffs.map((entity) => new GetTariffRdo(entity));
  }

  @ApiOkResponse({ type: Tariff })
  @Get('/tariffs/:id')
  async get(@Param('id') id: number) {
    return new GetTariffRdo(
      await this.tariffsService.findOne({
        where: { id },
        relations: {
          user: {
            studio: { city: true },
            role: true,
            avatar: true,
            category: true,
          },
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
            user: {
              studio: { city: true },
              role: true,
              avatar: true,
              category: true,
            },
          },
        },
        { ...updateTariffDto, sport: { id: updateTariffDto.sport } },
      ),
    );
  }
}
