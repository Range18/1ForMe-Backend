import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainingDto {
  @ApiProperty()
  readonly startTime: string;

  @ApiProperty()
  readonly date: Date;

  @ApiProperty()
  readonly client: number;

  @ApiProperty()
  readonly type?: number;

  @ApiProperty()
  readonly club: number;

  tariff?: number;
}
