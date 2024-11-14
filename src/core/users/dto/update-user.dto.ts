import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ChatTypes } from '#src/core/chat-types/types/chat-types.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  surname?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsPhoneNumber()
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsDateString()
  @IsOptional()
  birthday?: Date;

  @IsNumber()
  @IsOptional()
  chatType?: number;

  @IsEnum(ChatTypes)
  @IsString()
  @IsOptional()
  userNameInMessenger?: string;
}
