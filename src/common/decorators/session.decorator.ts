import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestSession } from '#src/common/types/request-session.type';
export const Session = createParamDecorator(
  (
    property: keyof RequestSession,
    context: ExecutionContext,
  ): RequestSession => {
    const request = context.switchToHttp().getRequest();
    return property ? request.session[property] : request.session;
  },
);
