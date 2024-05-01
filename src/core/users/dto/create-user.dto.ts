import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly surname?: string;

  @IsString()
  @ApiProperty()
  readonly phone: string;

  @IsString()
  @ApiProperty()
  readonly password?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly role: string;

  @ApiProperty()
  readonly birthday: Date;

  //If registered by trainer
  @IsNumber()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  readonly trainer?: number;

  //only for trainers
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  readonly studio?: number;

  @ApiProperty({ nullable: true, required: false })
  readonly whatsApp?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly link?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly experience?: number;

  @ApiProperty({ nullable: true, required: false })
  readonly description?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly category?: number;
}
