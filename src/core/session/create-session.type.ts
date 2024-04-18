import { TokenPayload } from '#src/core/session/types/user.payload';

export type CreateSession = Pick<TokenPayload, 'userId'>;
