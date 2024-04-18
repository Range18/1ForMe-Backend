import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from '#src/core/users/user.service';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
          relations: { role: true, avatar: true, studio: true },
        },
        {
          firstname: updateUserDto.firstname,
          phone: updateUserDto.phone,
          role: { id: updateUserDto.role },
          password: updateUserDto.password,
        },
      ),
    );
  }

  @Get('/sign-up/:link')
  async signUpToCoach(@Param('link') link: string) {
    return new GetUserRdo(
      await this.userService.findOne({
        where: { link: link },
        relations: { role: true, avatar: true, studio: true },
      }),
    );
  }
}
