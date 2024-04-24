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
import { ApiHeader, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { UpdateUserDto } from '#src/core/users/dto/update-user.dto';

@ApiTags('users')
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ type: [GetUserRdo] })
  @Get()
  async getAllUsers() {
    const users = await this.userService.find({
      relations: {
        role: true,
        avatar: true,
        studio: true,
        category: true,
        tariffs: true,
      },
    });

    return users.map((user) => new GetUserRdo(user));
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
            studio: true,
            category: true,
            tariffs: true,
          },
        },
        true,
      ),
    );
  }

  @ApiOkResponse({ type: GetUserRdo })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    schema: { format: 'Bearer ${AccessToken}' },
  })
  @AuthGuard()
  @Get('me')
  async getUserMe(@User() user: UserRequest) {
    return new GetUserRdo(
      await this.userService.findOne({
        where: { id: user.id },
        relations: {
          role: true,
          avatar: true,
          studio: true,
          category: true,
          tariffs: true,
        },
      }),
    );
  }

  @ApiOkResponse({ type: GetUserRdo })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    schema: { format: 'Bearer ${AccessToken}' },
  })
  @AuthGuard()
  @Patch()
  async update(
    @User() user: UserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return new GetUserRdo(
      await this.userService.updateOne(
        {
          where: { id: user.id },
          relations: {
            role: true,
            avatar: true,
            studio: true,
            category: true,
            tariffs: true,
          },
        },
        {
          ...updateUserDto,
          role: { id: updateUserDto.role },
          studio: { id: updateUserDto.studio },
          category: { id: updateUserDto.category },
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
