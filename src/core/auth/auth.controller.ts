import { Body, Controller, Delete, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoggedUserRdo } from '../users/rdo/logged-user.rdo';
import { LoginUserDto } from '#src/core/users/dto/login-user.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Session } from '#src/common/decorators/session.decorator';
import { type RequestSession } from '#src/common/types/request-session.type';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { User } from '#src/common/decorators/User.decorator';
import { CreateClientDto } from '#src/core/users/dto/create-client.dto';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ type: LoggedUserRdo })
  @Post('register')
  async registration(
    @Body() createUserDto: CreateUserDto,
  ): Promise<LoggedUserRdo> {
    if (createUserDto.role == 'trainer') {
      return await this.authService.registerAsTrainer(createUserDto);
    }
    return await this.authService.register(createUserDto);
  }

  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({ type: LoggedUserRdo })
  @Post('login')
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body() loginUserDto: LoginUserDto,
  ): Promise<LoggedUserRdo> {
    response.status(200);

    return await this.authService.login(loginUserDto);
  }

  @ApiHeader({
    name: 'Authorization',
    required: true,
    schema: { format: 'Bearer ${AccessToken}' },
  })
  @AuthGuard()
  @Delete('logout')
  async logout(@Session() session: RequestSession): Promise<void> {
    await this.authService.logout(session.sessionId);
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiCreatedResponse({ type: GetUserRdo })
  @ApiBody({ type: CreateClientDto })
  @AuthGuard()
  @Post('/register/byTrainer')
  async signUpToCoach(
    @User('id') trainerId: number,
    @Body() createClientDto: CreateClientDto,
  ) {
    return new GetUserRdo(
      await this.authService.signUpByTrainer(createClientDto, trainerId),
    );
  }
}
