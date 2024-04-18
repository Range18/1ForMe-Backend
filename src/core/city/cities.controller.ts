import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { City } from '#src/core/city/entity/cities.entity';
import { UpdateCityDto } from '#src/core/city/dto/update-city.dto';
import { CreateCityDto } from '#src/core/city/dto/create-city.dto';
import { CitiesService } from '#src/core/city/cities.service';

@ApiTags('Cities')
@Controller('api/cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @ApiCreatedResponse({ type: City })
  @Post()
  async create(@Body() body: CreateCityDto) {
    return await this.citiesService.save(body);
  }

  @ApiOkResponse({ type: [City] })
  @Get()
  async getAll() {
    return await this.citiesService.find({});
  }

  @ApiOkResponse({ type: City })
  @Get(':id')
  async get(@Param('id') id: number) {
    return await this.citiesService.findOne({ where: { id } });
  }

  // TODO PERMS
  @ApiOkResponse({ type: City })
  @ApiBody({ type: UpdateCityDto })
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateCityDto: UpdateCityDto) {
    return await this.citiesService.updateOne({ where: { id } }, updateCityDto);
  }
}
