import { ApiProperty } from '@nestjs/swagger';

export class CreateSportDto {
  @ApiProperty()
  readonly name: string;
}
