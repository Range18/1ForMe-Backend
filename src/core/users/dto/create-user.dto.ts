import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly firstname: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly surname: string;

  @IsString()
  @ApiProperty()
  readonly phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  readonly studio?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly role: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  readonly coachId?: number;
}
