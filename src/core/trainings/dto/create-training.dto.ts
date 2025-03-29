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
import { Transform } from 'class-transformer';

export class CreateTrainingDto implements ICreateTraining {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsNotEmpty()
  readonly slot: number;

  @IsDateString()
  @IsNotEmpty()
  readonly date: Date;

  @Transform(({ value }) =>
    value?.map((entry: unknown) =>
      typeof entry !== 'number' ? Number(entry) : entry,
    ),
  )
  @IsArray()
  @IsNotEmpty()
  readonly client: number[];

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Transform(({ value }) => (typeof value === 'number' ? Number(value) : value))
  @IsNotEmpty()
  readonly club: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Transform(({ value }) => (typeof value === 'number' ? Number(value) : value))
  @IsNotEmpty()
  readonly tariff: number;

  @IsBoolean()
  @IsOptional()
  isRepeated?: boolean;

  @IsString()
  @IsOptional()
  payVia: TransactionPaidVia = TransactionPaidVia.OnlineService;
}
