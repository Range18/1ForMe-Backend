import { ApiProperty } from '@nestjs/swagger';
import { Optional } from '@nestjs/common';
import { IsString } from 'class-validator';

export class CreateUserDto {
  readonly name?: string;

  readonly surname?: string;

  readonly phone: string;

  readonly password?: string;

  readonly role: string;

  readonly birthday?: Date;

  userNameInMessenger?: string;

  @IsString()
  @Optional()
  telegramUsername?: string;

  //If registered by trainer
  @ApiProperty({ nullable: true, required: false })
  readonly trainer?: number;

  //only for trainers
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
