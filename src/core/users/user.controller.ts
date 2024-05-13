import {
  Body,
  Controller,
  Get,
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

@ApiTags('users')
@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService, // private readonly commentsService: CommentsService,
  ) {}

  @ApiOkResponse({ type: [GetUserRdo] })
  @Get()
  async getAllUsers() {
    const users = await this.userService.find({
      relations: {
        role: true,
        avatar: true,
        studios: true,
        category: true,
        // tariffs: true,
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
        },
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
            // tariffs: true,
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
          studios: true,
          category: true,
          sports: true,
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
      relations: { studios: true },
    });
    if (userEntity.studios.length === 0) {
      userEntity.studios = [{ id: updateTrainerDto.studio } as Studio];
    } else {
      userEntity.studios.push({ id: updateTrainerDto.studio } as Studio);
    }

    await this.userService.save(userEntity);

    return new GetUserRdo(
      await this.userService.updateOne(
        {
          where: { id: user.id },
          relations: {
            role: true,
            avatar: true,
            studios: true,
            category: true,
          },
        },
        {
          ...updateTrainerDto,
          isTrainerActive: updateTrainerDto.isActive,
          role: { id: updateTrainerDto.role },
          studios: userEntity.studios,
          category: { id: updateTrainerDto.category },
        },
      ),
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
    // if (updateTrainerDto.comment) {
    //   const comment = await this.commentsService.findOne({
    //     where: { client: { id: id } },
    //   });
    //
    //   if (!comment) {
    //     await this.commentsService.save({
    //       trainer: { id: user.id },
    //       client: { id: id },
    //       text: updateTrainerDto.comment,
    //     });
    //   } else {
    //     await this.commentsService.updateOne(comment, {
    //       text: updateTrainerDto.comment,
    //     });
    //   }
    // }

    return new GetUserRdo(
      await this.userService.updateOne(
        {
          where: { id: id },
          relations: {
            role: true,
            avatar: true,
            relatedComments: true,
          },
        },
        {
          ...updateUserDto,
          role: { id: updateUserDto.role },
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
