import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  readonly login: string;

  @ApiProperty()
  readonly password: string;
}
