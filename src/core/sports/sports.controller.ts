import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SportsService } from '#src/core/sports/sports.service';
import { UpdateSportDto } from '#src/core/sports/dto/update-sport.dto';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { CreateSportDto } from '#src/core/sports/dto/create-sport.dto';

@ApiTags('Sports')
@Controller('api/sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @ApiCreatedResponse({ type: Sport })
  @Post()
  async create(@Body() body: CreateSportDto) {
    return await this.sportsService.save(body);
  }

  @ApiOkResponse({ type: [Sport] })
  @Get()
  async getAll() {
    return await this.sportsService.find({});
  }

  @ApiOkResponse({ type: Sport })
  @Get(':id')
  async get(@Param('id') id: number) {
    return await this.sportsService.findOne({ where: { id } });
  }

  // TODO PERMS
  @ApiOkResponse({ type: Sport })
  @ApiBody({ type: UpdateSportDto })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSportDto: UpdateSportDto,
  ) {
    return await this.sportsService.updateOne(
      { where: { id } },
      updateSportDto,
    );
  }
}
