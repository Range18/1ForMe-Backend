import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { CreateClientDto } from '#src/core/users/dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly userService: UserService) {}

  async createClient(dto: CreateClientDto) {
    const client = await this.userService.findOrCreate(dto);
    return await this.userService.updateOne(
      { where: { id: client.id } },
      {
        chatType: { id: dto.chatType },
        userNameInMessenger: dto.userNameInMessenger,
        name: dto.name,
        surname: dto.surname,
      },
    );
  }
}
