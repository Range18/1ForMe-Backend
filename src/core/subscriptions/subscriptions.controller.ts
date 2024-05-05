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
  ApiCreatedResponse,
  ApiHeader,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { GetSubscriptionRdo } from '#src/core/subscriptions/rdo/get-subscription.rdo';

@ApiTags('Subscriptions')
@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiCreatedResponse()
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Post()
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @User() user: UserRequest,
  ) {
    return await this.subscriptionsService.create(
      createSubscriptionDto,
      user.id,
    );
  }

  @Get()
  async findAll() {
    const subscriptions = await this.subscriptionsService.find({
      relations: {
        client: true,
        trainer: true,
        transaction: true,
        trainings: { type: true, club: true, sport: true },
      },
    });

    return subscriptions.map(
      (subscription) => new GetSubscriptionRdo(subscription),
    );
  }

  @ApiQuery({ name: 'clientId' })
  @ApiHeader({ name: 'Authorization' })
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
        transaction: true,
        trainings: { type: true, club: true, sport: true },
      },
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
          transaction: { tariff: true },
          trainings: {
            type: true,
            club: { city: true, studio: true },
            sport: true,
          },
        },
      }),
    );
  }

  // @Patch(':id')
  // async update(
  //   @Param('id') id: number,
  //   @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  // ) {
  //   return await this.subscriptionsService.updateOne({where: {id}}, updateSubscriptionDto);
  // }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.subscriptionsService.remove({ where: { id } });
  }
}
