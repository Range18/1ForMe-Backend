import { ApiProperty } from '@nestjs/swagger';

export class UpdateTrainingDto {
  @ApiProperty({ required: false })
  readonly date?: Date;

  @ApiProperty({ required: false })
  readonly club?: number;
}
