import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly login: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly password: string;
}
