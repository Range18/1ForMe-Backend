import { ApiProperty } from '@nestjs/swagger';

export class CreateStudioDto {
  @ApiProperty()
  readonly name: string;
}
