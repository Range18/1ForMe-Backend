import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

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

  @IsBoolean()
  @Transform(({ ...value }) => String(value) == 'true')
  @IsOptional()
  isRepeated?: boolean;
}
