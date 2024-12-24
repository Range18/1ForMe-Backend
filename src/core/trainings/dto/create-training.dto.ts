import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ICreateTraining } from '#src/core/trainings/types/create-training.interface';

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
}
