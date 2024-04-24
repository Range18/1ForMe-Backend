import { ApiProperty } from '@nestjs/swagger';
import { CreateTransactionDto } from '#src/core/transactions/dto/create-transaction.dto';

export class CreateTrainingDto {
  @ApiProperty()
  readonly status: string;

  @ApiProperty()
  readonly startTime: string;

  @ApiProperty()
  readonly duration: string;

  @ApiProperty()
  readonly date: Date;

  @ApiProperty()
  readonly client: number;

  @ApiProperty()
  readonly type: number;

  @ApiProperty()
  readonly sport: number;

  @ApiProperty({ type: () => CreateTransactionDto })
  createTransactionDto: CreateTransactionDto;
}
