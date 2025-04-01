import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TrainingTypeService } from '#src/core/training-type/training-type.service';
import { Training } from '#src/core/trainings/entities/training.entity';
import { CreateTrainingTypeDto } from '#src/core/training-type/dto/create-tr-type.dto';
import { TrainingTypeQueryDto } from '#src/core/training-type/dto/training-type-query.dto';
import { In } from 'typeorm';

@ApiTags('Training Types')
@Controller('api/trainings/types')
export class TrainingTypeController {
  constructor(private readonly typesService: TrainingTypeService) {}

  @ApiCreatedResponse({ type: Training })
  @Post()
  async create(@Body() body: CreateTrainingTypeDto) {
    return await this.typesService.save(body);
  }

  @ApiOkResponse({ type: [Training] })
  @Get()
  async getAll(@Query() query: TrainingTypeQueryDto) {
    return await this.typesService.find({
      where: { id: query.ids ? In(query.ids) : undefined },
    });
  }

  @ApiOkResponse({ type: Training })
  @Get(':id')
  async get(@Param('id') id: number) {
    return await this.typesService.findOne({ where: { id } });
  }

  // TODO PERMS
  // @ApiOkResponse({ type: Training })
  // @ApiBody({ type: UpdateTrainingTypeDto })
  // @Patch(':id')
  // async update(
  //   @Param('id') id: number,
  //   @Body() updateTrainingTypeDto: UpdateTrainingTypeDto,
  // ) {
  //   return await this.typesService.updateOne(
  //     { where: { id } },
  //     updateTrainingTypeDto,
  //   );
  // }
}
