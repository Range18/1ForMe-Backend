import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiProperty({ type: String, enum: ['Paid', 'Unpaid'] })
  status: string;
}
