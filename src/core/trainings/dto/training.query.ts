import { IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TrainingQuery {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  clientId?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  trainerId?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  clubId?: number;

  @IsDateString()
  @IsOptional()
  date?: Date;
}
