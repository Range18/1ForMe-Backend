import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainingDto {
  @ApiProperty()
  readonly status: string;

  @ApiProperty()
  readonly isFinished: boolean;

  @ApiProperty()
  readonly startTime: Date;

  @ApiProperty()
  readonly duration: string;

  @ApiProperty()
  readonly date: Date;

  @ApiProperty()
  readonly client: number;

  @ApiProperty()
  readonly type: number;

  @ApiProperty()
  readonly sport: number;
}
