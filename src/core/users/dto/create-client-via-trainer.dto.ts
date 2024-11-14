import { CreateUserDto } from '#src/core/users/dto/create-user.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Roles } from '#src/core/roles/types/roles.enum';
import { ChatTypes } from '#src/core/chat-types/types/chat-types.enum';

export class CreateClientViaTrainerDto
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

  @IsPhoneNumber()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(Roles)
  @IsString()
  @IsNotEmpty()
  role: Roles;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsNumber()
  @IsOptional()
  chatType?: number;

  @IsString()
  @IsOptional()
  chatId?: string;

  @IsEnum(ChatTypes)
  @IsString()
  @IsOptional()
  userNameInMessenger?: ChatTypes;
}
