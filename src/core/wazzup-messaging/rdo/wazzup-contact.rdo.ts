import { ApiProperty } from '@nestjs/swagger';
import { ContactDataDto } from '#src/core/wazzup-messaging/dto/contact-data.dto';

export class WazzupContactRdo {
  readonly id: string;

  responsibleUserId: string;

  name: string;

  @ApiProperty({ type: () => ContactDataDto })
  contactData: ContactDataDto[];
}
