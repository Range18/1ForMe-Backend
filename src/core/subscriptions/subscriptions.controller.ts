import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ApiCreatedResponse, ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';

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
    return await this.subscriptionsService.find({
      relations: {
        client: { avatar: true },
        trainer: true,
        transaction: true,
        trainings: { type: true, club: true, sport: true },
      },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.subscriptionsService.findOne({
      where: { id },
      relations: {
        client: { avatar: true },
        trainer: true,
        transaction: true,
        trainings: { type: true, club: true, sport: true },
      },
    });
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
