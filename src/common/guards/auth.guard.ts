import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from '#src/core/users/user.service';
import { SessionService } from '#src/core/session/session.service';
import { Request } from 'express';
import { TokenService } from '#src/core/token/token.service';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { TokenPayload } from '#src/core/session/types/user.payload';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { jwtConfig } from '#src/common/configs/config';
import { UserRequest } from '#src/common/types/user-request.type';
import SessionExceptions = AllExceptions.SessionExceptions;
import UserExceptions = AllExceptions.UserExceptions;
import AuthExceptions = AllExceptions.AuthExceptions;

@Injectable()
export class AuthGuardClass implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserRequest; session: object }>();

    const accessToken = this.extractAccessToken(request);

    if (!accessToken) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AuthExceptions',
        AuthExceptions.InvalidAccessToken,
      );
    }

    const payload: TokenPayload = await this.tokenService
      .verifyAsync<TokenPayload>(accessToken, {
        secret: jwtConfig.secret,
      })
      .catch((error) => {
        if (error.name === 'TokenExpiredError') {
          throw new ApiException(
            HttpStatus.UNAUTHORIZED,
            'AuthExceptions',
            AuthExceptions.ExpiredToken,
          );
        }

        throw new ApiException(
          HttpStatus.UNAUTHORIZED,
          'AuthExceptions',
          AuthExceptions.InvalidAccessToken,
        );
      });

    const user = await this.userService.findOne({
      where: { id: payload.userId },
      relations: { role: true },
    });

    if (!user) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    const session = await this.sessionService.findOne({
      where: { sessionId: payload.sessionId },
    });

    if (!session) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'SessionExceptions',
        SessionExceptions.SessionNotFound,
      );
    }

    request['user'] = {
      id: user.id,
      firstname: user.firstname,
      role: user.role,
    };

    request['user_session'] = {
      sessionId: session.sessionId,
      expireAt: session.expireAt,
    };

    return true;
  }

  private extractAccessToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' || type === 'AccessToken' || type === 'Token'
      ? token
      : undefined;
  }
}
