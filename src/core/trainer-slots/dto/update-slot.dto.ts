import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSlotDto {
  @IsString()
  @IsOptional()
  beginning?: string;

  @IsString()
  @IsOptional()
  end?: string;

  @ApiProperty()
  studio: number;
}
