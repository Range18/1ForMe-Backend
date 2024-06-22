import { NormalizedChatType } from '#src/core/wazzup-messaging/types/chat.type';

export class ContactDataDto {
  chatType: NormalizedChatType;

  chatId: string;

  username?: string;

  phone?: string;
}
