import { NormalizedChatType } from '#src/core/chat-types/types/chat.type';

export class ContactDataDto {
  chatType: NormalizedChatType;

  chatId: string;

  username?: string;

  phone?: string;
}
