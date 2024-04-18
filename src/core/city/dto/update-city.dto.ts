import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCityDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly name?: string;
}
