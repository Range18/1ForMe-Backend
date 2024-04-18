import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { UpdateTariffDto } from '#src/core/tariffs/dto/update-tariff.dto';
import { CreateTariffDto } from '#src/core/tariffs/dto/create-tariff.dto';

@ApiTags('Tariffs')
@Controller('api/trainers/tariffs')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @ApiCreatedResponse({ type: Tariff })
  @Post()
  async create(@Body() body: CreateTariffDto) {
    return await this.tariffsService.save(body);
  }

  @ApiOkResponse({ type: [Tariff] })
  @Get()
  async getAll() {
    return await this.tariffsService.find({});
  }

  @ApiOkResponse({ type: Tariff })
  @Get(':id')
  async get(@Param('id') id: number) {
    return await this.tariffsService.findOne({ where: { id } });
  }

  // TODO PERMS
  @ApiOkResponse({ type: Tariff })
  @ApiBody({ type: UpdateTariffDto })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTariffDto: UpdateTariffDto,
  ) {
    return await this.tariffsService.updateOne(
      { where: { id } },
      updateTariffDto,
    );
  }
}
