import { Slot } from '#src/core/slots/entities/slot.entity';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';
import { PickType } from '@nestjs/swagger';

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

  beginning: string;

  end: string;

  day: string;

  trainer: GetUserForSlots;

  studio: GetStudioForSlots;
  constructor(slot: Slot) {
    this.id = slot.id;
    this.beginning = slot.beginning;
    this.end = slot.end;
    this.day = slot.day;
    this.trainer = slot.trainer ? new GetUserRdo(slot.trainer) : undefined;
    this.studio = slot.studio ? new GetStudioRdo(slot.studio) : undefined;
  }
}
