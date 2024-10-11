import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class TrainingQuery {
  @IsNumber()
  @IsOptional()
  clientId?: number;

  @IsNumber()
  @IsOptional()
  trainerId?: number;

  @IsNumber()
  @IsOptional()
  clubId?: number;

  @IsDateString()
  @IsOptional()
  date?: Date;
}
