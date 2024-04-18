import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRequest } from '#src/common/types/user-request.type';
import { RequestExtended } from '#src/common/types/request-extended.type';

export const User = createParamDecorator(
  (key: keyof UserRequest, context: ExecutionContext): any | UserRequest => {
    const request = context.switchToHttp().getRequest<RequestExtended>();
    const user = request.user;
    return key ? user[key] : user;
  },
);
