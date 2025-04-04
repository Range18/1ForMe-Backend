import { ApiProperty } from '@nestjs/swagger';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';

export class GetTariffRdo {
  readonly id: number;

  readonly name: string;

  readonly cost: number;

  readonly duration: string;

  strikethroughTrainingPrice?: number;

  @ApiProperty({ nullable: true, type: () => GetStudioRdo })
  studio?: GetStudioRdo;

  @ApiProperty({ type: Sport })
  sport?: Sport;

  trainerCategory: string;

  readonly subExpireAt?: number;

  readonly trainingAmount?: number;

  clientsAmount: number;

  type: string;

  isPublic: boolean;

  constructor(tariff: Tariff) {
    this.id = tariff.id;
    this.name = tariff.name;
    this.cost = tariff.cost;
    this.duration = tariff.duration;
    this.studio = tariff.studio ? new GetStudioRdo(tariff.studio) : undefined;
    this.sport = tariff.sport ? tariff.sport : undefined;
    this.trainerCategory = tariff.category ? tariff.category.name : undefined;
    this.subExpireAt = tariff.subExpireAt;
    this.strikethroughTrainingPrice = tariff.strikethroughTrainingPrice;
    this.trainingAmount = tariff.trainingAmount;
    this.clientsAmount = tariff.clientsAmount;
    this.type = tariff.type ? tariff.type.name : undefined;
    this.isPublic = tariff.isPublic;
  }
}
