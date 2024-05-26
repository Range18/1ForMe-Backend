export type ChatType = 'telegram' | 'tgapi' | 'whatsapp';
export type NormalizedChatType = Exclude<ChatType, 'tgapi'>;
