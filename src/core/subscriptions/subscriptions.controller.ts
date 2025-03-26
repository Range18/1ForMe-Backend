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
import { CreateSubscriptionViaCardDto } from '#src/core/subscriptions/dto/create-subscription-via-card.dto';

@ApiTags('Subscriptions')
@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

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

  @Post('card')
  async createViaCard(
    @Body() createSubscriptionDto: CreateSubscriptionViaCardDto,
  ) {
    return new GetSubscriptionRdo(
      await this.subscriptionsService.createViaCard(createSubscriptionDto),
    );
  }

  // @ApiBody({ type: CreateSubscriptionDto })
  // @ApiCreatedResponse({ type: GetSubscriptionRdo })
  // @Post('clientForm')
  // async createViaClient(
  //   @Body() createSubscriptionDto: CreateSubscriptionViaClientDto,
  // ) {
  //   let client = await this.userService.findOne(
  //     {
  //       where: { phone: createSubscriptionDto.createClient.phone },
  //     },
  //     false,
  //   );
  //
  //   if (!client) {
  //     const { phone } = await this.authService.register(
  //       createSubscriptionDto.createClient,
  //     );
  //
  //     client = await this.userService.findOne({ where: { phone } });
  //   }
  //
  //   return new GetSubscriptionRdo(
  //     await this.subscriptionsService.create(
  //       {
  //         client: client.id,
  //         ...createSubscriptionDto,
  //         payVia: TransactionPaidVia.OnlineService,
  //       },
  //       createSubscriptionDto.trainerId,
  //     ),
  //   );
  // }

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
      order: { expireAt: 'DESC' },
    });

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
