import { PartialType } from '@nestjs/mapped-types';
import { CreateChatTypeDto } from './create-chat-type.dto';

export class UpdateChatTypeDto extends PartialType(CreateChatTypeDto) {}
