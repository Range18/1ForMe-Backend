import { IsOptional } from 'class-validator';

export class CreateTrainingDto {
  readonly slot: number;

  readonly date: Date;

  readonly client: number[];

  readonly club: number;

  readonly tariff: number;

  @IsOptional()
  isRepeated?: boolean;
}
