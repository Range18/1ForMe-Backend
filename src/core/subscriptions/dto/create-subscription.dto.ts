import { ApiProperty } from '@nestjs/swagger';
import { CreateSubTrainingDto } from '#src/core/trainings/dto/create-sub-training.dto';
import { IsArray, IsNotEmpty, IsNumber, IsObject } from 'class-validator';

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
}
