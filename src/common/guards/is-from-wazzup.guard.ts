import { CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { wazzupConfig } from '#src/common/configs/wazzup.config';
import AuthExceptions = AllExceptions.AuthExceptions;

export class IsFromWazzupGuardClass implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractCrmToken(request);

    console.log(request.headers.authorization);

    if (!token || token !== wazzupConfig.apiKey) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'AuthExceptions',
        AuthExceptions.InvalidCrmToken,
      );
    }

    return token === wazzupConfig.apiKey;
  }

  private extractCrmToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
