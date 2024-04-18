import { ApiProperty } from '@nestjs/swagger';

export class CreateCityDto {
  @ApiProperty()
  readonly name: string;
}
