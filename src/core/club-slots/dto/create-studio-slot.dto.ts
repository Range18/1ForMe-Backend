import { ApiProperty } from '@nestjs/swagger';

export class CreateStudioSlotDto {
  @ApiProperty()
  beginning: string;

  @ApiProperty()
  end: string;
}
