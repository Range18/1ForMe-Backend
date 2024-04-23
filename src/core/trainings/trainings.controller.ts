import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { GetTrainingRdo } from '#src/core/trainings/rdo/get-training.rdo';

@ApiTags('Trainings')
@Controller('api/trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @ApiBody({ type: CreateTrainingDto })
  @ApiCreatedResponse({ type: GetTrainingRdo })
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Post()
  async create(
    @Body() createTrainingDto: CreateTrainingDto,
    @User() user: UserRequest,
  ) {
    const [hours, minutes] = createTrainingDto.duration
      .split(':')
      .map((el) => Number(el));
    const [date, time] = createTrainingDto.startTime.toString().split('T');

    const [startHours, startMin, startMil] = time
      .split(':')
      .map((el) => Number(el));

    const training = await this.trainingsService.save({
      sport: { id: createTrainingDto.sport },
      status: createTrainingDto.status,
      isFinished: createTrainingDto.isFinished,
      type: { id: createTrainingDto.type },
      date: createTrainingDto.date,
      startTime: createTrainingDto.startTime,
      client: { id: createTrainingDto.client },
      trainer: { id: user.id },
      duration: createTrainingDto.duration,
      endTime: `${startHours + hours + Math.floor((startMin + minutes) / 60)}:${
        (startMin + minutes) % 60 == 0 ? '00' : (startMin + minutes) % 60
      }`,
    });

    return new GetTrainingRdo(
      await this.trainingsService.findOne({ where: { id: training.id } }),
    );
  }

  @ApiOkResponse({ type: [GetTrainingRdo] })
  @Get()
  async findAll() {
    const trainings = await this.trainingsService.find({});

    return trainings.map((training) => new GetTrainingRdo(training));
  }

  @ApiOkResponse({ type: GetTrainingRdo })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return new GetTrainingRdo(
      await this.trainingsService.findOne({ where: { id } }),
    );
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
