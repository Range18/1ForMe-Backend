import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTariffDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly cost?: string;
}
