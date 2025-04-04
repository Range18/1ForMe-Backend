import {
  Body,
  Controller,
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
import { UpdateTrainingDto } from '#src/core/trainings/dto/update-training.dto';
import { MoreThanOrEqual } from 'typeorm';
import { TrainingCountPerDateRdo } from '#src/core/trainings/rdo/training-count-per-date.rdo';
import { CreateTrainingViaClientDto } from '#src/core/trainings/dto/create-training-via-client.dto';
import { GetCreatedTrainingsRdo } from '#src/core/trainings/rdo/get-created-trainings.rdo';
import { RolesGuard } from '#src/common/decorators/guards/roles-guard.decorator';
import { TrainingQuery } from '#src/core/trainings/dto/training.query';

@ApiTags('Trainings')
@Controller('api/trainings')
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly userService: UserService,
  ) {}

  @ApiBody({ type: CreateTrainingDto })
  @ApiCreatedResponse({ type: GetCreatedTrainingsRdo })
  @AuthGuard()
  @Post()
  async create(
    @Body() createTrainingDto: CreateTrainingDto,
    @User() user: UserRequest,
  ): Promise<GetCreatedTrainingsRdo> {
    return await this.trainingsService.purchaseTraining(
      createTrainingDto,
      user.id,
      createTrainingDto.client,
    );
  }

  @ApiBody({ type: CreateTrainingViaClientDto })
  @ApiCreatedResponse({ type: GetCreatedTrainingsRdo })
  @Post('clientForm')
  async createClientForm(
    @Body() createTrainingViaClientDto: CreateTrainingViaClientDto,
  ): Promise<GetCreatedTrainingsRdo> {
    return await this.trainingsService.createWithUnknownClients(
      createTrainingViaClientDto,
    );
  }

  @ApiOkResponse({ type: [GetTrainingRdo] })
  @AuthGuard()
  @Get()
  async findAll(@Query() query: TrainingQuery) {
    const trainings = await this.trainingsService.find({
      where: {
        date: query.date,
        client: query.clientId ? { id: query.clientId } : undefined,
        trainer: query.trainerId ? { id: query.trainerId } : undefined,
        club: query.clubId ? { id: query.clubId } : undefined,
        isCanceled: false,
      },
      relations: {
        client: true,
        trainer: true,
        transaction: { tariff: { sport: true, type: true } },
        club: { city: true, studio: { city: true } },
        subscription: { transaction: { tariff: { sport: true } } },
        slot: true,
      },
      order: { date: 'ASC', slot: { id: 'ASC' } },
    });

    return trainings.map((training) => new GetTrainingRdo(training));
  }

  //Get all trainer`s trainings on date with count
  @ApiQuery({ name: 'date', type: Date })
  @ApiOkResponse({ type: GetTrainingExtraRdo })
  @AuthGuard()
  @Get('/trainers/my')
  async findAllMine(@User() user: UserRequest, @Query('date') date?: Date) {
    const trainings = await this.trainingsService.find({
      where: {
        trainer: { id: user.id },
        date: date ? date : undefined,
        isCanceled: false,
      },
      relations: {
        client: true,
        trainer: true,
        club: { city: true, studio: { city: true } },
        transaction: { tariff: { sport: true, type: true } },
        subscription: { transaction: { tariff: { sport: true } } },
        slot: true,
      },
      order: { slot: { id: 'ASC' } },
    });

    return new GetTrainingExtraRdo(
      trainings.length,
      date,
      trainings.map((training) => new GetTrainingRdo(training)),
    );
  }

  // Get Trainer`s clients with the closest training
  @ApiOkResponse({ type: [GetUserRdo] })
  @AuthGuard()
  @Get('my/clients')
  async getMyClients(@User() user: UserRequest) {
    let clients = await this.userService.find(
      {
        relations: { trainers: true },
      },
      true,
    );

    clients = clients.filter((client) =>
      client.trainers.some((trainer) => trainer.id == user.id),
    );

    const clientsWithNextTraining: GetUserRdo[] = [];

    for (const client of clients) {
      const trainings = await this.trainingsService.find(
        {
          where: {
            client: { id: client.id },
            trainer: { id: user.id },
            isCanceled: false,
            date: MoreThanOrEqual(new Date(Date.now())),
          },
          relations: {
            trainer: true,
            club: { city: true, studio: true },
            transaction: { tariff: { sport: true, type: true } },
            subscription: { transaction: { tariff: { sport: true } } },
            slot: true,
          },
          order: { date: 'ASC', slot: { id: 'ASC' } },
        },
        false,
      );

      if (trainings.length !== 0) {
        clientsWithNextTraining.push(new GetUserRdo(client, trainings[0]));
      } else {
        clientsWithNextTraining.push(new GetUserRdo(client));
      }
    }

    clientsWithNextTraining.sort((a, b) => {
      if (!a.closestTraining) {
        return 1;
      }
      if (!b.closestTraining) {
        return -1;
      }

      return (
        new Date(a.closestTraining.date).getTime() -
        new Date(b.closestTraining.date).getTime()
      );
    });

    return clientsWithNextTraining;
  }

  //Get client`s trainings
  @ApiOkResponse({ type: [GetTrainingRdo] })
  @AuthGuard()
  @Get('my')
  async getMyTrainings(@User() user: UserRequest) {
    const trainings = await this.trainingsService.find({
      where: { client: { id: user.id }, isCanceled: false },
      relations: {
        trainer: true,
        club: { city: true },
        transaction: { tariff: { sport: true, type: true } },
        subscription: { transaction: { tariff: { sport: true } } },
        slot: true,
      },
      order: { date: 'ASC', slot: { id: 'ASC' } },
    });

    return trainings.map((training) => new GetTrainingRdo(training));
  }

  //Get someone client trainings
  @ApiOkResponse({ type: [GetTrainingRdo] })
  @AuthGuard()
  @Get('clients/:id')
  async getClientTrainings(@Param('id') id: number, @User() user: UserRequest) {
    const trainings = await this.trainingsService.find({
      where: {
        client: { id: id },
        trainer: user.role.name === 'trainer' ? { id: user.id } : undefined,
        isCanceled: false,
      },
      relations: {
        trainer: true,
        club: { city: true },
        transaction: { tariff: { sport: true, type: true } },
        subscription: { transaction: { tariff: { sport: true } } },
        slot: true,
      },
      order: { date: 'ASC', slot: { id: 'ASC' } },
    });

    return trainings.map((training) => new GetTrainingRdo(training));
  }

  @ApiOkResponse({ type: GetTrainingRdo })
  @Get('byId/:id')
  async findOne(@Param('id') id: number) {
    return new GetTrainingRdo(
      await this.trainingsService.findOne({
        where: { id },
        relations: {
          trainer: true,
          club: { city: true, studio: true },
          transaction: { tariff: { sport: true, type: true } },
          subscription: { transaction: { tariff: { sport: true } } },
          slot: true,
          client: true,
        },
      }),
    );
  }

  @ApiOkResponse({ type: [TrainingCountPerDateRdo] })
  @AuthGuard()
  @Get('my/count')
  async getMyTrainingsCount(@User() user: UserRequest) {
    return await this.trainingsService.getTrainingsPerDay(user.id);
  }

  @ApiOkResponse({ type: GetTrainingRdo })
  @AuthGuard()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTrainingDto: UpdateTrainingDto,
    @User() user: UserRequest,
  ): Promise<GetTrainingRdo> {
    const training = await this.trainingsService.updateOneWithMsg(
      id,
      user.id,
      updateTrainingDto,
    );

    return new GetTrainingRdo(training);
  }

  @RolesGuard('trainer', 'client', 'admin')
  @AuthGuard()
  @Post('cancel/:id')
  async cancelTraining(@Param('id') id: number, @User() user: UserRequest) {
    await this.trainingsService.cancelTraining(id, user.id);
    return 'OK';
  }

  @RolesGuard('trainer', 'client', 'admin')
  @AuthGuard()
  @Post('cancel/:id/repeated')
  async cancelRepeatedTraining(
    @Param('id') id: number,
    @User() user: UserRequest,
  ) {
    await this.trainingsService.cancelRepeatedTraining(id, user.id);
    return 'OK';
  }
}
