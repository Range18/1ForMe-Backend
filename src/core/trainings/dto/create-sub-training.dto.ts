import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSubTrainingDto {
  @IsNotEmpty()
  readonly date: Date;

  @IsNumber()
  @IsNotEmpty()
  readonly slot: number;

  @IsNumber()
  @IsNotEmpty()
  readonly club: number;
}
