import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from '#src/core/users/user.service';
import { ApiBody, ApiOkResponse, ApiTags, OmitType } from '@nestjs/swagger';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { UpdateTrainerDto } from '#src/core/users/dto/update-trainer.dto';
import { UpdateUserDto } from '#src/core/users/dto/update-user.dto';
import { GetUserWithPhoneRdo } from '#src/core/users/rdo/get-user-with-phone.rdo';
import { UsersQuery } from '#src/core/users/dto/users.query';
import { SignUpToTrainer } from '#src/core/users/dto/sign-up-to-trainer.query';

@ApiTags('users')
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(@Query() query: UsersQuery) {
    const users = await this.userService.find({
      where: { role: query.role ? { name: query.role } : undefined },
      relations: {
        role: true,
        avatar: true,
        studios: true,
        category: true,
        sports: true,
        chatType: true,
      },
    });

    return users.map((user) => new GetUserRdo(user));
  }

  @Get('/trainers')
  async getAllTrainers() {
    const users = await this.userService.find({
      where: { role: { name: 'trainer' } },
      relations: {
        role: true,
        avatar: true,
        studios: true,
        category: true,
        sports: true,
        chatType: true,
      },
    });

    return users.map((user) => new GetUserWithPhoneRdo(user));
  }

  @AuthGuard()
  @ApiOkResponse({ type: [GetUserRdo] })
  //TODO
  // @Get('trainers/me/clients')
  @Get('trainers/clients')
  async getAllTrainerClients(@User() user: UserRequest) {
    const userEntity = await this.userService.findOne({
      where: { id: user.id },
      relations: {
        clients: {
          avatar: true,
          relatedComments: { trainer: true },
          role: true,
          chatType: true,
        },
        chatType: true,
      },
    });

    return userEntity?.clients.map((user) => {
      return new GetUserWithPhoneRdo(user);
    });
  }

  @ApiOkResponse({ type: GetUserWithPhoneRdo })
  @Get('/byId/:id')
  async getUser(@Param('id', new ParseIntPipe()) id: number) {
    return new GetUserWithPhoneRdo(
      await this.userService.findOne(
        {
          where: { id },
          relations: {
            role: true,
            avatar: true,
            studios: true,
            category: true,
            sports: true,
            chatType: true,
          },
        },
        true,
      ),
    );
  }

  @ApiOkResponse({ type: GetUserWithPhoneRdo })
  @AuthGuard()
  @Get('me')
  async getUserMe(@User() user: UserRequest) {
    return new GetUserWithPhoneRdo(
      await this.userService.findOne({
        where: { id: user.id },
        relations: {
          role: true,
          avatar: true,
          category: true,
          studios: true,
          sports: true,
          chatType: true,
        },
      }),
    );
  }

  //TODO
  @ApiOkResponse({ type: GetUserWithPhoneRdo })
  @ApiBody({ type: UpdateTrainerDto })
  @AuthGuard()
  @Patch('/me')
  async updateSelf(
    @User() user: UserRequest,
    @Body() updateTrainerDto: UpdateTrainerDto,
  ) {
    await this.userService.updateTrainerWithChecks(user.id, updateTrainerDto);

    return new GetUserWithPhoneRdo(
      await this.userService.findOne({ where: { id: user.id } }),
    );
  }

  @ApiOkResponse({ type: OmitType(GetUserRdo, ['trainerProfile']) })
  @ApiBody({ type: UpdateUserDto })
  @AuthGuard()
  @Patch('/byId/:id')
  async updateSomeone(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return new GetUserWithPhoneRdo(
      await this.userService.updateUserWithChecks(id, updateUserDto),
    );
  }

  @Post('/sign-up-to-trainer')
  async signUpToCoachSelf(
    @Query() query: SignUpToTrainer,
    @User('id') userId: number,
  ) {
    return new GetUserWithPhoneRdo(
      await this.userService.signUp(query.link, userId),
    );
  }
}
