import { ApiProperty } from '@nestjs/swagger';

export class CreateClubSlotDto {
  @ApiProperty()
  beginning: string;

  @ApiProperty()
  end: string;
}
