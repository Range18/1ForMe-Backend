import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  surname?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  password?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  phone?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  role?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  tax?: number;

  @ApiProperty({ nullable: true, required: false })
  studio?: number;

  @ApiProperty({ nullable: true, required: false })
  category?: number;

  @ApiProperty({ nullable: true, required: false })
  readonly experience?: number;

  @ApiProperty({ nullable: true, required: false })
  readonly description?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly whatsApp?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly link?: string;
}
