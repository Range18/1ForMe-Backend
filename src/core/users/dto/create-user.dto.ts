import { Optional } from '@nestjs/common';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Roles } from '#src/core/roles/types/roles.enum';
import { IUser } from '#src/core/users/types/user.interface';

export class CreateUserDto implements IUser {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  surname?: string;

  @Matches('^7\\d{10}$')
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(Roles)
  @IsString()
  @IsNotEmpty()
  role: Roles;

  @IsDateString()
  @IsOptional()
  birthday?: Date;

  @IsString()
  @IsOptional()
  userNameInMessenger?: string;

  @IsString()
  @Optional()
  telegramUsername?: string;

  @IsNumber()
  @IsOptional()
  trainer?: number; //If registered by trainer

  //Only for trainers
  @IsNumber()
  @IsOptional()
  studio?: number;

  @IsString()
  @IsOptional()
  whatsApp?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsNumber()
  @IsOptional()
  experience?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  category?: number;
}
