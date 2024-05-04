import { ApiProperty } from '@nestjs/swagger';

export class UpdateSlotDto {
  @ApiProperty({ required: false })
  beginning?: string;

  @ApiProperty({ required: false })
  end?: string;

  @ApiProperty()
  studio: number;
}
