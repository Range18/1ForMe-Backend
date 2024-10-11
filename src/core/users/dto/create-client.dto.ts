import { CreateUserDto } from '#src/core/users/dto/create-user.dto';

export class CreateClientDto
  implements
    Pick<CreateUserDto, 'name' | 'surname' | 'role' | 'phone' | 'password'>
{
  name: string;

  surname?: string;

  password?: string;

  phone: string;

  role: string;

  chatType: number;

  userNameInMessenger: string;
}
