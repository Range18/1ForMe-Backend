import { ApiProperty } from '@nestjs/swagger';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { frontendServer } from '#src/common/configs/config';
import { Sport } from '#src/core/sports/entity/sports.entity';

export class GetTrainerRdo {
  //Only for trainers
  @ApiProperty({ nullable: true, type: () => GetStudioRdo })
  readonly studios?: GetStudioRdo[];

  @ApiProperty({ nullable: true })
  readonly category?: string;

  // @ApiProperty({ nullable: true, type: () => [GetTariffRdo] })
  // readonly tariff?: GetTariffRdo[];

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

  readonly sports?: Sport[];

  readonly isActive: boolean;

  constructor(user: UserEntity) {
    this.studios = user.studios
      ? user.studios.map((studio) => new GetStudioRdo(studio))
      : undefined;
    // this.tariff = user?.tariffs
    //   ? user.tariffs.map((tariff) => new GetTariffRdo(tariff))
    //   : undefined;
    this.category = user.category ? user.category.name : undefined;
    this.whatsApp = user.whatsApp ?? undefined;
    this.experience = user.experience ?? undefined;
    this.description = user.description ?? undefined;
    //TODO
    this.link = user.link
      ? `${frontendServer.url}/trainers?link=${user.link}`
      : undefined;
    this.sports = user.sports ?? undefined;
    this.tax = user.tax ?? undefined;
    this.isActive = user.isTrainerActive;
  }
}
