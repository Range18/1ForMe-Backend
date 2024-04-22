import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';

@ApiTags('Trainings')
@Controller('api/trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Post()
  async create(
    @Body() createTrainingDto: CreateTrainingDto,
    @User() user: UserRequest,
  ) {
    const [hours, minutes] = createTrainingDto.duration.split(':');
    const [date, time] = createTrainingDto.startTime.toString().split('T');

    const [startHours, startMin, startMil] = time.split(':');
    return await this.trainingsService.save({
      sport: { id: createTrainingDto.sport },
      status: createTrainingDto.status,
      isFinished: createTrainingDto.isFinished,
      type: { id: createTrainingDto.type },
      date: createTrainingDto.date,
      startTime: createTrainingDto.startTime,
      client: { id: createTrainingDto.client },
      trainer: { id: user.id },
      endTime:
        date + 'T' + `${startHours + hours}:${startMin + minutes}:${startMil}Z`,
    });
  }

  @Get()
  async findAll() {
    return await this.trainingsService.find({});
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.trainingsService.findOne({ where: { id } });
  }

  // @Patch(':id')
  // async update(
  //   @Param('id') id: number,
  //   @Body() updateTrainingDto: UpdateTrainingDto,
  // ) {
  //   return await this.trainingsService.updateOne(
  //     { where: { id } },
  //     updateTrainingDto,
  //   );
  // }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.trainingsService.remove({ where: { id } });
  }
}
