import { CreateUserDto } from '#src/core/users/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto
  implements
    Pick<CreateUserDto, 'name' | 'surname' | 'role' | 'phone' | 'password'>
{
  @ApiProperty()
  name: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  password?: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  role: string;

  chatType: number;

  userNameInMessenger: string;
}
