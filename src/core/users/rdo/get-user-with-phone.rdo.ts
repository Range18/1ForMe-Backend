import { UserEntity } from '#src/core/users/entity/user.entity';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';

export class GetUserWithPhoneRdo extends GetUserRdo {
  phone: string;

  constructor(user: UserEntity) {
    super(user);
    this.phone = user.phone;
  }
}
