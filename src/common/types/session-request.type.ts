import { SessionEntity } from '#src/core/session/session.entity';

export type SessionRequest = Pick<SessionEntity, 'sessionId' | 'expireAt'>;
