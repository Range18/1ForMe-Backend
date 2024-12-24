import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Roles } from '#src/core/roles/types/roles.enum';
import { IUser } from '#src/core/users/types/user.interface';

export class CreateClientDto implements IUser {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  surname?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @Matches('^7\\d{10}$')
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(Roles)
  @IsString()
  @IsNotEmpty()
  role: Roles;

  @IsNumber()
  @IsNotEmpty()
  chatType: number;

  @Matches('^@[a-zA-Z0-9_]+$')
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  userNameInMessenger: string;
}
