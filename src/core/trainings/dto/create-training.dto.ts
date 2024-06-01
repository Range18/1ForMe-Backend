import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainingDto {
  @ApiProperty()
  readonly slot: number;

  @ApiProperty()
  readonly date: Date;

  @ApiProperty({ type: [Number] })
  readonly client: number[];

  @ApiProperty()
  readonly club: number;

  tariff: number;
}
