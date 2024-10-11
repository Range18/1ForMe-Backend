import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  readonly name?: string;

  readonly surname?: string;

  readonly phone: string;

  readonly password?: string;

  readonly role: string;

  readonly birthday?: Date;

  userNameInMessenger?: string;

  //If registered by trainer
  @ApiProperty({ nullable: true, required: false })
  readonly trainer?: number;

  //only for trainers
  @ApiProperty({ nullable: true, required: false })
  readonly studio?: number;

  @ApiProperty({ nullable: true, required: false })
  readonly whatsApp?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly link?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly experience?: number;

  @ApiProperty({ nullable: true, required: false })
  readonly description?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly category?: number;
}
