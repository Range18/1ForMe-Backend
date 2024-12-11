import { ApiProperty } from '@nestjs/swagger';
import { CreateClientDto } from '#src/core/users/dto/create-client.dto';
import { CreateSubTrainingDto } from '#src/core/trainings/dto/create-sub-training.dto';
import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';

export class CreateSubscriptionViaClientDto {
  @IsNumber()
  @IsNotEmpty()
  readonly trainerId: number;

  @ApiProperty({
    type: () => [CreateSubTrainingDto],
  })
  @IsObject({ each: true })
  @IsArray()
  @IsNotEmpty()
  createTrainingDto: CreateSubTrainingDto[];

  @IsNumber()
  @IsNotEmpty()
  readonly tariff: number;

  @IsNotEmptyObject()
  @IsObject()
  @IsOptional()
  readonly createClient?: CreateClientDto;
}
