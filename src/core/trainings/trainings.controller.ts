import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { GetTrainingRdo } from '#src/core/trainings/rdo/get-training.rdo';
import { GetTrainingExtraRdo } from '#src/core/trainings/rdo/get-training-extra.rdo';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { UserService } from '#src/core/users/user.service';
import { TrainingStatusType } from '#src/core/trainings/training-status.type';
import { MoreThanOrEqual } from 'typeorm';
import { UpdateTrainingDto } from '#src/core/trainings/dto/update-training.dto';

@ApiTags('Trainings')
@Controller('api/trainings')
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly userService: UserService,
  ) {}

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
    const trainings = await this.trainingsService.find({
      relations: {
        client: { avatar: true },
        trainer: { avatar: true },
        transaction: { tariff: true },
        sport: true,
        type: true,
        club: { city: true, studio: { city: true } },
      },
    });

    return trainings.map((training) => new GetTrainingRdo(training));
  }

  @ApiQuery({ name: 'date', type: Date })
  @ApiOkResponse({ type: GetTrainingExtraRdo })
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Get('/trainers/my')
  async findAllMine(@User() user: UserRequest, @Query('date') date?: Date) {
    const trainings = await this.trainingsService.find({
      where: { trainer: { id: user.id }, date: date ? date : undefined },
      relations: {
        client: { avatar: true },
        trainer: { avatar: true },
        transaction: { tariff: true },
        sport: true,
        type: true,
        club: { city: true, studio: { city: true } },
      },
      order: { startTime: 'ASC' },
    });

    return new GetTrainingExtraRdo(
      trainings.length,
      date,
      trainings.map((training) => new GetTrainingRdo(training)),
    );
  }

  @ApiQuery({ name: 'date', type: Date })
  @ApiOkResponse({ type: [GetUserRdo] })
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Get('my/clients')
  async getMyClients(@User() user: UserRequest, @Query('date') date?: Date) {
    const clients = await this.userService.find(
      {
        where: { trainers: [{ id: user.id }] },
        relations: {
          role: true,
          avatar: true,
          studio: true,
          category: true,
          tariffs: true,
        },
      },
      true,
    );

    const rdo: GetUserRdo[] = [];

    for (const client of clients) {
      const trainings = await this.trainingsService.find({
        where: {
          client: { id: client.id },
          trainer: { id: user.id },
          status: TrainingStatusType.NotFinished,
          date: MoreThanOrEqual(date),
        },
        relations: {
          client: { avatar: true },
          trainer: { avatar: true },
          club: { studio: true, city: true },
          sport: true,
        },
        order: { date: 'ASC', startTime: 'ASC' },
      });

      rdo.push(new GetUserRdo(client, trainings[0]));
    }

    return rdo;
  }

  @ApiOkResponse({ type: [GetTrainingRdo] })
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Get('my')
  async getMyTrainings(@User() user: UserRequest) {
    const trainings = await this.trainingsService.find({
      where: { client: { id: user.id } },
      relations: {
        trainer: true,
        club: { city: true },
        sport: true,
        type: true,
      },
    });

    return trainings.map((training) => new GetTrainingRdo(training));
  }

  @ApiOkResponse({ type: [GetTrainingRdo] })
  @Get('clients/:id')
  async getClientTrainings(@Param('id') id: number) {
    const trainings = await this.trainingsService.find({
      where: { client: { id: id } },
      relations: {
        trainer: true,
        club: { city: true },
        sport: true,
        type: true,
      },
    });

    return trainings.map((training) => new GetTrainingRdo(training));
  }

  @ApiOkResponse({ type: GetTrainingRdo })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return new GetTrainingRdo(
      await this.trainingsService.findOne({ where: { id } }),
    );
  }

  @ApiOkResponse({ type: GetTrainingRdo })
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTrainingDto: UpdateTrainingDto,
    @User() user: UserRequest,
  ): Promise<GetTrainingRdo> {
    return new GetTrainingRdo(
      await this.trainingsService.updateOne(
        {
          where: { id, trainer: { id: user.id } },
          relations: {
            club: { city: true },
            sport: true,
            type: true,
            trainer: true,
            client: true,
          },
        },
        {
          club: { id: updateTrainingDto.club },
          date: updateTrainingDto.date,
          status: updateTrainingDto.status,
        },
      ),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.trainingsService.remove({ where: { id } });
  }
}
