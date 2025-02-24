import { GetTariffRdo } from '#src/core/tariffs/rdo/get-tariff.rdo';
import { plainToInstance, Transform } from 'class-transformer';

export class GiftCardRdo {
  id: string;

  name: string;

  position: number;

  @Transform(({ value }) => plainToInstance(GetTariffRdo, value))
  tariff: GetTariffRdo;
}
