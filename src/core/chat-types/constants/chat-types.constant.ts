import { NormalizedChatType } from '#src/core/chat-types/types/chat.type';

export const chatTypes: { [key in NormalizedChatType]: NormalizedChatType } = {
  whatsapp: 'whatsapp',
  telegram: 'telegram',
};
