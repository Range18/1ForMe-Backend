import { CreateClientDto } from '#src/core/users/dto/create-client.dto';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ICreateTraining } from '#src/core/trainings/types/create-training.interface';
import { Type } from 'class-transformer';

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

  @ValidateNested({ each: true })
  @Type(() => CreateClientDto)
  @IsArray()
  @IsNotEmpty()
  readonly clients: CreateClientDto[];

  @IsBoolean()
  @IsOptional()
  isRepeated?: boolean;

  @IsString()
  @IsOptional()
  promoCode?: string;

  @IsBoolean()
  @IsOptional()
  isPaymentForTwo?: boolean = false;
}
