import { Exclude } from 'class-transformer';

export class LoggedUserRdo {
  readonly accessToken: string;

  @Exclude()
  readonly sessionExpireAt: Date;

  readonly phone: string;

  constructor(accessToken: string, sessionExpireAt: Date, phone: string) {
    this.accessToken = accessToken;
    this.sessionExpireAt = sessionExpireAt;
    this.phone = phone;
  }
}
