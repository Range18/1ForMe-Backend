import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { AuthService } from '#src/core/auth/auth.service';
import { CreateClientDto } from '#src/core/users/dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async createClient(dto: CreateClientDto) {
    const client = await this.userService.findOne(
      { where: { phone: dto.phone } },
      false,
    );
    if (!client) {
      const { phone } = await this.authService.register(dto);
      return await this.userService.findOne({ where: { phone } });
    }
    return await this.userService.updateOne(
      { where: { id: client.id } },
      { chatType: { id: dto.chatType } },
    );
  }
}
