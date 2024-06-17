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
import { UserService } from '#src/core/users/user.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  OmitType,
} from '@nestjs/swagger';
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
import UserExceptions = AllExceptions.UserExceptions;

@ApiTags('users')
@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService, // private readonly commentsService: CommentsService,
  ) {}

  @ApiOkResponse({ type: [GetUserRdo] })
  @ApiQuery({ name: 'role' })
  @Get()
  async getAllUsers(@Query('role') role?: string) {
    const users = await this.userService.find({
      where: { role: role ? { name: role } : undefined },
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

  @AuthGuard()
  @ApiOkResponse({ type: [GetUserRdo] })
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
      return new GetUserRdo(user);
    });
  }

  @ApiOkResponse({ type: GetUserRdo })
  @Get('/byId/:id')
  async getUser(@Param('id') id: number) {
    return new GetUserRdo(
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

  @ApiOkResponse({ type: GetUserRdo })
  @AuthGuard()
  @Get('me')
  async getUserMe(@User() user: UserRequest) {
    return new GetUserRdo(
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

  @ApiOkResponse({ type: GetUserRdo })
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
    }
    userEntity.studios = studios;

    const sports = [];
    if (updateTrainerDto.sports) {
      for (const sport of updateTrainerDto.sports) {
        sports.push({ id: sport } as Sport);
      }
    }
    userEntity.sports = sports;

    await this.userService.updateOne(userEntity, {
      ...updateTrainerDto,
      isTrainerActive: updateTrainerDto.isActive,
      role: { id: updateTrainerDto.role },
      studios: [],
      category: { id: updateTrainerDto.category },
      sports: [],
      chatType: { id: updateTrainerDto.chatType },
    });

    return new GetUserRdo(
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
    return new GetUserRdo(
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
          role: { id: updateUserDto.role },
          chatType: { id: updateUserDto.chatType },
        },
      ),
    );
  }

  @ApiQuery({ name: 'link' })
  @Post('/trainers')
  async signUpToCoachSelf(
    @Query('link') link: string,
    @User('id') userId: number,
  ) {
    return new GetUserRdo(await this.userService.signUp(link, userId));
  }
}
