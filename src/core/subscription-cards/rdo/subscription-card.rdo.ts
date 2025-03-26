import { GetTariffRdo } from '#src/core/tariffs/rdo/get-tariff.rdo';

export class SubscriptionCardRdo {
  id: string;

  name: string;

  position: number;

  //TODO: Fix 502
  // @Transform(({ value }) => plainToInstance(GetTariffRdo, value))
  tariff: GetTariffRdo;
}
