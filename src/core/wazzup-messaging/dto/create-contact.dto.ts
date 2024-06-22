import { ContactDataDto } from '#src/core/wazzup-messaging/dto/contact-data.dto';

export class CreateContactDto {
  responsibleUserId: string;

  name: string;

  contactData: ContactDataDto[];

  source: 'auto' | 'byUser'; // auto - при входящем или исходящем, byUser - по кнопке
}
