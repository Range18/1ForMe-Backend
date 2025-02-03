import { CreateClientDto } from '#src/core/users/dto/create-client.dto';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
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

  @IsNumber()
  @IsNotEmpty()
  readonly club: number;

  @IsNumber()
  @IsNotEmpty()
  readonly tariff: number;

  @IsNumber()
  @IsNotEmpty()
  readonly trainerId: number;

  @Validate(CreateClientDto, { each: true })
  @IsArray()
  @IsOptional()
  readonly clients: CreateClientDto[];

  @IsBoolean()
  @IsOptional()
  isRepeated?: boolean;
}
