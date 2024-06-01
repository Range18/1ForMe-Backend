import { ApiProperty } from '@nestjs/swagger';

export class UpdateSlotDto {
  @ApiProperty({ required: false })
  beginning?: number;

  @ApiProperty({ required: false })
  end?: number;

  @ApiProperty()
  studio: number;
}
