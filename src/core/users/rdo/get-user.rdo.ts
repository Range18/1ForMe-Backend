import { UserEntity } from '#src/core/users/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';
import { backendServer, frontendServer } from '#src/common/configs/config';
import { GetTariffRdo } from '#src/core/tariffs/rdo/get-tariff.rdo';

export class GetUserRdo {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly surname: string;

  @ApiProperty()
  readonly phone: string;

  @ApiProperty({ type: () => RolesEntity })
  readonly role: RolesEntity;

  @ApiProperty({ nullable: true })
  readonly avatar?: string;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()
  readonly createdAt: Date;

  //Only for trainers
  @ApiProperty({ nullable: true, type: () => GetStudioRdo })
  readonly studio?: GetStudioRdo;

  @ApiProperty({ nullable: true })
  readonly category?: string;

  @ApiProperty({ nullable: true, type: () => [GetTariffRdo] })
  readonly tariff?: GetTariffRdo[];

  @ApiProperty({ nullable: true })
  readonly whatsApp?: string;

  @ApiProperty({ nullable: true })
  readonly link?: string;

  @ApiProperty({ nullable: true })
  readonly experience?: number;

  @ApiProperty({ nullable: true })
  readonly description?: string;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.name = user.name;
    this.surname = user.surname;
    this.phone = user.phone;
    this.role = user.role;
    this.avatar = user.avatar
      ? `${backendServer.urlValue}/api/assets/${user.avatar.id}/file`
      : undefined;

    this.studio = user.studio ? new GetStudioRdo(user.studio) : undefined;
    this.tariff = user.tariffs
      ? user.tariffs.map((tariff) => new GetTariffRdo(tariff))
      : undefined;
    this.category = user.category ? user.category.name : undefined;
    this.whatsApp = user.whatsApp ?? undefined;
    this.experience = user.experience ?? undefined;
    this.description = user.description ?? undefined;
    //TODO
    this.link = user.link
      ? `${frontendServer.url}/trainers?link=${user.link}`
      : undefined;

    this.updatedAt = user.updatedAt;
    this.createdAt = user.createdAt;
  }
}