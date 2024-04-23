import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { GetTariffRdo } from '#src/core/tariffs/rdo/get-tariff.rdo';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';

export class GetTransactionRdo {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => GetUserRdo })
  client: GetUserRdo;

  @ApiProperty({ type: () => GetUserRdo })
  trainer: GetUserRdo;

  @ApiProperty()
  status: string;

  @ApiProperty()
  cost: number;

  @ApiProperty({ type: () => GetTariffRdo })
  tariff: GetTariffRdo;

  @ApiProperty({ type: () => Sport })
  sport: Sport;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.client = new GetUserRdo(transaction.client);
    this.trainer = new GetUserRdo(transaction.trainer);

    this.sport = transaction.sport;
    this.tariff = new GetTariffRdo(transaction.tariff);
    this.cost = transaction.customCost ?? transaction?.tariff.cost;
    this.status = transaction.status;
    this.createdAt = transaction.createdAt;
    this.updatedAt = transaction.updatedAt;
  }
}
