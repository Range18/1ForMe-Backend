import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ nullable: true, required: false })
  comment?: string;

  @ApiProperty({ nullable: true, required: false })
  birthday?: Date;

  chatType?: number;

  userNameInMessenger?: string;
}
