import { ChatTypes } from '#src/core/chat-types/entities/chat-type.entity';

export class ContactData {
  chatType: ChatTypes;

  chatId: string;

  username: string;

  phone: string;
}
