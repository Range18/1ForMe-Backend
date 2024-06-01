import { ApiProperty } from '@nestjs/swagger';

export class CreateSlotDto {
  @ApiProperty()
  beginning: number;

  @ApiProperty()
  end: number;

  date: Date;

  @ApiProperty()
  studio: number;
}
