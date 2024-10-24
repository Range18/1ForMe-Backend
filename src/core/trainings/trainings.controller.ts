import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
import { AuthService } from '#src/core/auth/auth.service';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { GetCreatedTrainingsRdo } from '#src/core/trainings/rdo/get-created-trainings.rdo';
import { RolesGuard } from '#src/common/decorators/guards/roles-guard.decorator';
import { TrainingQuery } from '#src/core/trainings/dto/training.query';
import UserExceptions = AllExceptions.UserExceptions;

@ApiTags('Trainings')
@Controller('api/trainings')
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiBody({ type: CreateTrainingDto })
  @ApiCreatedResponse({ type: GetCreatedTrainingsRdo })
  @AuthGuard()
  @Post()
  async create(
    @Body() createTrainingDto: CreateTrainingDto,
    @User() user: UserRequest,
  ): Promise<GetCreatedTrainingsRdo> {
    return await this.trainingsService.create(
      createTrainingDto,
      user.id,
      createTrainingDto.client,
    );
  }

  @ApiBody({ type: CreateTrainingViaClientDto })
  @ApiCreatedResponse({ type: GetCreatedTrainingsRdo })
  @Post('clientForm')
  async createClientForm(
    @Body() createTrainingDto: CreateTrainingViaClientDto,
  ): Promise<GetCreatedTrainingsRdo> {
    let trainings: GetCreatedTrainingsRdo;

    if (
      !createTrainingDto.client &&
      createTrainingDto.client?.length == 0 &&
      !createTrainingDto.createClient
    ) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'UserExceptions',
        UserExceptions.NoClientData,
      );
    }

    if (createTrainingDto.client && createTrainingDto.client?.length > 0) {
      trainings = await this.trainingsService.create(
        createTrainingDto,
        createTrainingDto.trainerId,
        createTrainingDto.client,
      );
    } else {
      let client = await this.userService.findOne(
        {
          where: { phone: createTrainingDto.createClient.phone },
        },
        false,
      );

      if (!client) {
        const { phone } = await this.authService.register(
          createTrainingDto.createClient,
        );

        client = await this.userService.findOne({
          where: { phone },
        });
      }

      const clients = createTrainingDto.client ? createTrainingDto.client : [];
      clients.push(client.id);

      trainings = await this.trainingsService.create(
        createTrainingDto,
        createTrainingDto.trainerId,
        clients,
      );
    }

    return trainings;
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
      where: { trainer: { id: user.id }, date: date ? date : undefined },
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
      where: { client: { id: user.id } },
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
      {
        where: { id, trainer: { id: user.id } },
        relations: {
          trainer: true,
          club: { city: true },
          transaction: { tariff: { sport: true, type: true } },
          subscription: { transaction: { tariff: { sport: true } } },
          slot: true,
          client: { chatType: true },
        },
      },
      {
        club: { id: updateTrainingDto.club },
        slot: { id: updateTrainingDto.slot },
        date: updateTrainingDto.date,
      },
    );

    return new GetTrainingRdo(training);
  }

  @RolesGuard('trainer', 'client', 'admin')
  @AuthGuard()
  @Post('cancel/:id')
  async cancelTraining(@Param('id') id: number, @User() user: UserRequest) {
    return this.trainingsService.cancelTraining(id, user.id);
  }

  @RolesGuard('trainer', 'client', 'admin')
  @AuthGuard()
  @Post('cancel/:id/repeated')
  async cancelRepeatedTraining(
    @Param('id') id: number,
    @User() user: UserRequest,
  ) {
    return this.trainingsService.cancelRepeatedTraining(id, user.id);
  }
}
