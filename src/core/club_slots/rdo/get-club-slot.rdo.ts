import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';
import { PickType } from '@nestjs/swagger';
import { GetClubRdo } from '#src/core/clubs/rdo/get-club.rdo';
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

export class GetClubSlotRdo {
  id: number;

  beginning: string;

  end: string;

  club: GetClubRdo;

  constructor(slot: ClubSlots) {
    this.id = slot.id;
    this.beginning = slot.beginning;
    this.end = slot.end;
    this.club = slot.club ? new GetClubRdo(slot.club) : undefined;
  }
}
