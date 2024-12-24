import { CreateClientDto } from '#src/core/users/dto/create-client.dto';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  Validate,
} from 'class-validator';
import { ICreateTraining } from '#src/core/trainings/types/create-training.interface';

export class CreateTrainingViaClientDto implements ICreateTraining {
  @IsNumber()
  @IsNotEmpty()
  readonly slot: number;

  @IsDateString()
  @IsNotEmpty()
  readonly date: Date;

  @IsArray()
  @IsOptional()
  readonly client?: number[];

  // @IsNumber()
  @IsNotEmpty()
  readonly club: number;

  @IsNumber()
  @IsNotEmpty()
  readonly tariff: number;

  @IsNumber()
  @IsNotEmpty()
  readonly trainerId: number;

  @Validate(CreateClientDto)
  @IsNotEmptyObject()
  @IsObject()
  @IsOptional()
  readonly createClient?: CreateClientDto;

  @IsBoolean()
  @IsOptional()
  isRepeated?: boolean;
}
