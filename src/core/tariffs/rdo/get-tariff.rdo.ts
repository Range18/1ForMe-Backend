import { ApiProperty } from '@nestjs/swagger';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';

export class GetTariffRdo {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly cost: number;

  @ApiProperty({ nullable: true, type: () => GetUserRdo })
  trainer?: GetUserRdo;

  constructor(tariff: Tariff) {
    this.id = tariff.id;
    this.name = tariff.name;
    this.cost = tariff.cost;
    this.trainer = tariff.user ? new GetUserRdo(tariff.user) : undefined;
  }
}
