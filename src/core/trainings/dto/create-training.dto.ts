import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ICreateTraining } from '#src/core/trainings/types/create-training.interface';
import { TransactionPaidVia } from '#src/core/transactions/types/transaction-paid-via.enum';

export class CreateTrainingDto implements ICreateTraining {
  @IsNumber()
  @IsNotEmpty()
  readonly slot: number;

  @IsDateString()
  @IsNotEmpty()
  readonly date: Date;

  @IsArray()
  @IsNotEmpty()
  readonly client: number[];

  // @IsNumber()
  @IsNotEmpty()
  readonly club: number;

  // @IsNumber()
  @IsNotEmpty()
  readonly tariff: number;

  @IsBoolean()
  @IsOptional()
  isRepeated?: boolean;

  @IsString()
  @IsOptional()
  payVia: TransactionPaidVia = TransactionPaidVia.OnlineService;
}
