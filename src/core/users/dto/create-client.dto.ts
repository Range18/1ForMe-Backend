import { CreateUserDto } from '#src/core/users/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto
  implements
    Pick<CreateUserDto, 'name' | 'surname' | 'role' | 'phone' | 'password'>
{
  @ApiProperty()
  name: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  surname: string;

  @ApiProperty({ nullable: true, required: false })
  comment?: string;

  chatType?: number;
}
