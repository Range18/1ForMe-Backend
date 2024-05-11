import { Slot } from '#src/core/slots/entities/slot.entity';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';
import { PickType } from '@nestjs/swagger';
import { ClubSlots } from '#src/core/club_slots/entities/club-slot.entity';

class GetUserForSlots extends PickType(GetUserRdo, [
  'id',
  'surname',
  'name',
  'phone',
  'createdAt',
  'updatedAt',
  'birthday',
]) {}

class GetStudioForSlots extends PickType(GetStudioRdo, [
  'id',
  'name',
  'city',
  'address',
]) {}

export class GetSlotRdo {
  id: number;

  beginning: ClubSlots;

  end: ClubSlots;

  day: number;

  trainer: GetUserForSlots;

  studio: GetStudioForSlots;

  constructor(slot: Slot) {
    this.id = slot.id;
    this.beginning = slot.beginning ?? undefined;
    this.end = slot.end ?? undefined;
    this.day = slot.day;
    this.trainer = slot.trainer ? new GetUserRdo(slot.trainer) : undefined;
    this.studio = slot.studio ? new GetStudioRdo(slot.studio) : undefined;
  }
}
