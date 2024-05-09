import { ApiProperty } from '@nestjs/swagger';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';

export class GetTariffRdo {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly cost: number;

  readonly duration: string;

  @ApiProperty({ nullable: true, type: () => GetUserRdo })
  trainer?: GetUserRdo;

  @ApiProperty({ type: Sport })
  sport?: Sport;

  readonly subExpireAt?: Date;

  readonly trainingAmount?: number;

  constructor(tariff: Tariff) {
    this.id = tariff.id;
    this.name = tariff.name;
    this.cost = tariff.cost;
    this.duration = tariff.duration;
    this.trainer = tariff.user ? new GetUserRdo(tariff.user) : undefined;
    this.sport = tariff.sport ? tariff.sport : undefined;
    this.subExpireAt = tariff.subExpireAt;
    this.trainingAmount = tariff.trainingAmount;
  }
}
