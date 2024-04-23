import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ nullable: true, required: false })
  customCost?: number;

  @ApiProperty()
  client: number;

  @ApiProperty()
  sport: number;

  @ApiProperty({ nullable: true, required: false })
  tariff?: number;
}
