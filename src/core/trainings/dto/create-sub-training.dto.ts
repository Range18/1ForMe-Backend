import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSubTrainingDto {
  @IsDateString()
  @IsNotEmpty()
  readonly date: Date;

  @IsNumber()
  @IsNotEmpty()
  readonly slot: number;

  @IsNumber()
  @IsNotEmpty()
  readonly club: number;
}
