import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

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

  @Matches('^7\\d{10}$')
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

  @IsString()
  @IsOptional()
  userNameInMessenger?: string;
}
