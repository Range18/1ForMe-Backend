import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Trainings')
@Controller('api/trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post()
  async create(@Body() createTrainingDto: CreateTrainingDto) {
    return await this.trainingsService.save(createTrainingDto);
  }

  @Get()
  async findAll() {
    return await this.trainingsService.find({});
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.trainingsService.findOne({ where: { id } });
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ) {
    return await this.trainingsService.updateOne(
      { where: { id } },
      updateTrainingDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.trainingsService.remove({ where: { id } });
  }
}
