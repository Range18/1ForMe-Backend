import { ApiProperty } from '@nestjs/swagger';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';
import { GetTariffRdo } from '#src/core/tariffs/rdo/get-tariff.rdo';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { frontendServer } from '#src/common/configs/config';

export class GetTrainerRdo {
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

  @ApiProperty({ nullable: true })
  readonly tax?: number;

  readonly isActive: boolean;

  constructor(user: UserEntity) {
    this.studio = user.studio ? new GetStudioRdo(user.studio) : undefined;
    this.tariff = user?.tariffs
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
    this.tax = user.tax ?? undefined;
    this.isActive = user.isTrainerActive;
  }
}
