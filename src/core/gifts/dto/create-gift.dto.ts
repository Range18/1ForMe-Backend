import { CreateUserForGiftDto } from '#src/core/users/dto/create-user-for-gift.dto';

export class CreateGiftDto {
  sender: CreateUserForGiftDto;

  recipient: CreateUserForGiftDto;

  giftCardId: string;

  message?: string;

  sendAt?: Date;
}
