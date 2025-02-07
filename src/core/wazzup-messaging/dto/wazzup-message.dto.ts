import { NormalizedChatType } from '#src/core/chat-types/types/chat.type';

export class WazzupMessageDto {
  readonly messageId: string;

  readonly dateTime: Date;

  readonly channelId: string;

  readonly chatType: NormalizedChatType;

  readonly chatId: string;

  readonly type: string;

  readonly isEcho: boolean;

  readonly contact: { name: string; username: string; phone: string };

  readonly text: string;

  readonly status: string;
}
