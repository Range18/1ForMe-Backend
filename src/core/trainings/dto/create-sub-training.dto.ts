import { IsDateString, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

export class CreateSubTrainingDto {
  @IsDateString()
  @MinLength(1)
  @IsNotEmpty()
  readonly date: Date;

  @IsNumber()
  @IsNotEmpty()
  readonly slot: number;

  @IsNumber()
  @IsNotEmpty()
  readonly club: number;
}
