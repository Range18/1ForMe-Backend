import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class UpdateTrainingDto {
  @IsDateString()
  @IsOptional()
  readonly date?: Date;

  @IsNumber()
  @IsOptional()
  readonly club?: number;

  @IsNumber()
  @IsOptional()
  readonly slot?: number;
}
