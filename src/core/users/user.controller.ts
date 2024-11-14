import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
import { Studio } from '#src/core/studios/entities/studio.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { GetUserWithPhoneRdo } from '#src/core/users/rdo/get-user-with-phone.rdo';
import { UsersQuery } from '#src/core/users/dto/users.query';
import { SignUpToTrainer } from '#src/core/users/dto/sign-up-to-trainer.query';
import UserExceptions = AllExceptions.UserExceptions;

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
    const userEntity = await this.userService.findOne({
      where: { id: user.id },
      relations: {
        role: true,
        avatar: true,
        studios: true,
        category: true,
        sports: true,
        chatType: true,
      },
    });

    if (updateTrainerDto.phone) {
      const userWithSamePhone = await this.userService.findOne({
        where: { phone: updateTrainerDto.phone },
      });

      if (userWithSamePhone && userEntity.id !== userWithSamePhone.id) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'UserExceptions',
          UserExceptions.UserAlreadyExists,
        );
      }
    }

    if (updateTrainerDto.sports) {
      userEntity.sports = null;
    }
    if (updateTrainerDto.studios) {
      userEntity.studios = null;
    }
    if (updateTrainerDto.sports || updateTrainerDto.studios) {
      await this.userService.save(userEntity);
    }

    const studios = [];
    if (updateTrainerDto.studios) {
      for (const studio of updateTrainerDto.studios) {
        studios.push({ id: studio } as Studio);
      }
      userEntity.studios = studios;
    }

    const sports = [];
    if (updateTrainerDto.sports) {
      for (const sport of updateTrainerDto.sports) {
        sports.push({ id: sport } as Sport);
      }
      userEntity.sports = sports;
    }

    await this.userService.updateOne(userEntity, {
      ...updateTrainerDto,
      isTrainerActive: updateTrainerDto.isActive,
      studios: [],
      category: { id: updateTrainerDto.category },
      sports: [],
      chatType: { id: updateTrainerDto.chatType },
    });

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
    @User() user: UserRequest,
  ) {
    return new GetUserWithPhoneRdo(
      await this.userService.updateOne(
        {
          where: { id: id },
          relations: {
            role: true,
            avatar: true,
            relatedComments: true,
            chatType: true,
          },
        },
        {
          ...updateUserDto,
          chatType: { id: updateUserDto.chatType },
        },
      ),
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
