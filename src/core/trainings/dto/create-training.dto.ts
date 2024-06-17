import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateTrainingDto {
  @ApiProperty()
  readonly slot: number;

  @ApiProperty()
  readonly date: Date;

  @ApiProperty({ type: [Number] })
  readonly client: number[];

  @ApiProperty()
  readonly club: number;

  @Transform(({ ...value }) => Number(value))
  @IsNumber()
  readonly tariff: number;
}
