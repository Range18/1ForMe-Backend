import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { ClubSlots } from '#src/core/club-slots/entities/club-slot.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { GetClubSlotRdo } from '#src/core/club-slots/rdo/get-club-slot.rdo';

export class GetSlotForTimeTableRdo {
  slotId: number;

  beginning: string;

  end: string;

  trainersAvailable?: GetUserRdo[];

  isAvailable?: boolean;

  constructor(
    slot: ClubSlots | GetClubSlotRdo,
    isAvailable?: boolean,
    trainersAvailable: UserEntity[] = [],
  ) {
    this.slotId = slot.id;
    this.beginning = slot.beginning;
    this.end = slot.end;
    this.trainersAvailable = trainersAvailable
      ? trainersAvailable.map((trainer) => new GetUserRdo(trainer))
      : [];
    this.isAvailable = isAvailable;
  }
}
