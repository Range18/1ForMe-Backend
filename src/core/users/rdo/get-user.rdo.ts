import { UserEntity } from '#src/core/users/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';
import { backendServer } from '#src/common/configs/config';

export class GetUserRdo {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly firstname: string;

  @ApiProperty()
  readonly surname: string;

  @ApiProperty()
  readonly phone: string;

  @ApiProperty({ type: () => RolesEntity })
  readonly role: RolesEntity;

  @ApiProperty({ nullable: true })
  readonly avatar?: string;

  @ApiProperty({ nullable: true, type: GetStudioRdo })
  readonly studio?: GetStudioRdo;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()
  readonly createdAt: Date;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.firstname = user.firstname;
    this.surname = user.surname;
    this.phone = user.phone;
    this.role = user.role;
    this.avatar = user.avatar
      ? `${backendServer.urlValue}/api/assets/${user.avatar.id}/file`
      : undefined;
    this.studio = user.studio ? new GetStudioRdo(user.studio) : undefined;

    this.updatedAt = user.updatedAt;
    this.createdAt = user.createdAt;
  }
}
