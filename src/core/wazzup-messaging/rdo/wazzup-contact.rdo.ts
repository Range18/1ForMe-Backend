import { ContactData } from '#src/core/wazzup-messaging/rdo/contact-data.rdo';

export class WazzupContactRdo {
  readonly id: string;

  responsibleUserId: string;

  name: string;

  contactData: ContactData[];
}
