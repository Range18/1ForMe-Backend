import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { GetSubscriptionRdo } from '#src/core/subscriptions/rdo/get-subscription.rdo';
import * as console from 'node:console';
import { CreateSubscriptionViaClientDto } from '#src/core/subscriptions/dto/create-subscription-via-client.dto';
import { AuthService } from '#src/core/auth/auth.service';
import { UserService } from '#src/core/users/user.service';

@ApiTags('Subscriptions')
@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiBody({ type: CreateSubscriptionDto })
  @ApiCreatedResponse({ type: GetSubscriptionRdo })
  @AuthGuard()
  @Post()
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @User() user: UserRequest,
  ) {
    return new GetSubscriptionRdo(
      await this.subscriptionsService.create(createSubscriptionDto, user.id),
    );
  }

  @ApiBody({ type: CreateSubscriptionDto })
  @ApiCreatedResponse({ type: GetSubscriptionRdo })
  @Post('clientForm')
  async createViaClient(
    @Body() createSubscriptionDto: CreateSubscriptionViaClientDto,
  ) {
    const { phone } = await this.authService.register(
      createSubscriptionDto.createClient,
    );

    const client = await this.userService.findOne({ where: { phone } });

    return new GetSubscriptionRdo(
      await this.subscriptionsService.create(
        { client: client.id, ...createSubscriptionDto },
        createSubscriptionDto.trainerId,
      ),
    );
  }

  @Get()
  async findAll() {
    const subscriptions = await this.subscriptionsService.find({
      relations: {
        client: true,
        trainer: true,
        transaction: { tariff: { type: true, sport: true } },
        trainings: { club: true, slot: true },
      },
    });

    return subscriptions.map(
      (subscription) => new GetSubscriptionRdo(subscription),
    );
  }

  @ApiQuery({ name: 'clientId' })
  @AuthGuard()
  @Get('/my')
  async findAllMy(
    @User() user: UserRequest,
    @Query('clientId') clientId?: number,
  ) {
    const subscriptions = await this.subscriptionsService.find({
      where: {
        trainer: { id: user.id },
        client: clientId ? { id: clientId } : undefined,
      },
      relations: {
        client: true,
        trainer: true,
        transaction: { tariff: { type: true, sport: true } },
        trainings: { club: true, slot: true },
      },
    });

    console.log(subscriptions);

    return subscriptions.map(
      (subscription) => new GetSubscriptionRdo(subscription),
    );
  }

  @Get('byId/:id')
  async findOne(@Param('id') id: number) {
    return new GetSubscriptionRdo(
      await this.subscriptionsService.findOne({
        where: { id },
        relations: {
          client: true,
          trainer: true,
          transaction: { tariff: { type: true, sport: true } },
          trainings: {
            club: { city: true, studio: true },
            slot: true,
          },
        },
      }),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.subscriptionsService.remove({ where: { id } });
  }
}
