import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookie = createParamDecorator(
  (key: string, context: ExecutionContext): string | object => {
    const request = context.switchToHttp().getRequest<Request>();
    return key ? request.cookies[key] : request.cookies;
  },
);
