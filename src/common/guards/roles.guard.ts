import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserRequest } from '#src/common/types/user-request.type';
import { Reflector } from '@nestjs/core';
import { ROLES_METADATA_KEY } from '#src/common/decorators/guards/roles-guard.decorator';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';

@Injectable()
export class RolesGuardClass implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserRequest; session: object }>();
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allowedRoles) return true;

    const user = request['user'];

    //TODO

    return true;
  }
}
