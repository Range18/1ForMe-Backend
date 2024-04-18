import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  firstname?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  surname?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  password?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  phone?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  role?: number;
}
