import { Request } from 'express';
import { UserRequest } from '#src/common/types/user-request.type';
import { SessionRequest } from '#src/common/types/session-request.type';

export type RequestExtended = Request & {
  user?: UserRequest;
  session?: SessionRequest;
};
