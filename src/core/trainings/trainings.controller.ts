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
    return new GetTrainingRdo(
      await this.trainingsService.create(createTrainingDto, user.id),
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
