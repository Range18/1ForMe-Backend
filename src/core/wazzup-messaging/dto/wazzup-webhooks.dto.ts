import { CreateContactDto } from '#src/core/wazzup-messaging/dto/create-contact.dto';
import { WazzupMessageDto } from '#src/core/wazzup-messaging/dto/wazzup-message.dto';

export class WazzupWebhooksDto {
  messages?: WazzupMessageDto[];

  createContact?: CreateContactDto;

  channelsUpdates?: any;
}
