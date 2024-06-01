import { ApiProperty } from '@nestjs/swagger';

export class UpdateClubSlotDto {
  @ApiProperty({ required: false })
  beginning?: string;

  @ApiProperty({ required: false })
  end?: string;

  @ApiProperty()
  club: number;
}
