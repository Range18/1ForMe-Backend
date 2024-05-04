import { ApiProperty } from '@nestjs/swagger';

export class CreateSlotDto {
  @ApiProperty()
  beginning: string;

  @ApiProperty()
  end: string;

  @ApiProperty()
  day: string;

  @ApiProperty()
  studio: number;
}
