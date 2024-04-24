import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ nullable: true, required: false })
  customCost?: number;

  @ApiProperty({ nullable: true, required: false })
  tariff?: number;
}
