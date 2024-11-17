import { CreateUserDto } from '#src/core/users/dto/create-user.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Roles } from '#src/core/roles/types/roles.enum';
import { ChatTypes } from '#src/core/chat-types/types/chat-types.enum';

export class CreateClientDto
  implements
    Pick<CreateUserDto, 'name' | 'surname' | 'role' | 'phone' | 'password'>
{
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

  @IsEnum(ChatTypes)
  @IsString()
  @IsNotEmpty()
  userNameInMessenger: ChatTypes;
}
