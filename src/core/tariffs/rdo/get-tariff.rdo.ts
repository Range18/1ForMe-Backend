import { ApiProperty } from '@nestjs/swagger';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { Category } from '#src/core/categories/entity/categories.entity';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';

export class GetTariffRdo {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly cost: number;

  readonly duration: string;

  @ApiProperty({ nullable: true, type: () => GetStudioRdo })
  studio?: GetStudioRdo;

  @ApiProperty({ type: Sport })
  sport?: Sport;

  @ApiProperty({ type: Sport })
  category: Category;

  readonly subExpireAt?: number;

  readonly trainingAmount?: number;

  constructor(tariff: Tariff) {
    this.id = tariff.id;
    this.name = tariff.name;
    this.cost = tariff.cost;
    this.duration = tariff.duration;
    this.studio = tariff.studio ? new GetStudioRdo(tariff.studio) : undefined;
    this.sport = tariff.sport ? tariff.sport : undefined;
    this.category = tariff.category ?? undefined;
    this.subExpireAt = tariff.subExpireAt;
    this.trainingAmount = tariff.trainingAmount;
  }
}
