import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateSubTrainingDto {
  @IsDateString()
  @IsNotEmpty()
  readonly date: Date;

  @IsNotEmpty()
  readonly slot: number;

  @IsNotEmpty()
  readonly club: number;
}
