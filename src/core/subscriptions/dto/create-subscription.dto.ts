import { ApiProperty } from '@nestjs/swagger';
import { CreateSubTrainingDto } from '#src/core/trainings/dto/create-sub-training.dto';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { TransactionPaidVia } from '#src/core/transactions/types/transaction-paid-via.enum';

export class CreateSubscriptionDto {
  @IsNumber()
  @IsNotEmpty()
  client: number;

  @ApiProperty({
    type: () => [CreateSubTrainingDto],
  })
  @IsObject({ each: true })
  @IsArray()
  @IsNotEmpty()
  createTrainingDto: CreateSubTrainingDto[];

  @IsNumber()
  @IsNotEmpty()
  tariff: number;

  @IsString()
  @IsNotEmpty()
  payVia: TransactionPaidVia;
}
