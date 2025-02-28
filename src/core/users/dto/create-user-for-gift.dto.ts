import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserForGiftDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches('^7\\d{10}$')
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsNumber()
  @IsNotEmpty()
  chatType: number;

  @Matches('^@[a-zA-Z0-9_]+$')
  @MinLength(6)
  @IsString()
  @IsOptional()
  userNameInMessenger?: string;
}
