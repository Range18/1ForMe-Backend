import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudioDto {
  @ApiProperty()
  readonly name: string;
}
