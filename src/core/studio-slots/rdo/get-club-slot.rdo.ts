import { GetClubRdo } from '#src/core/clubs/rdo/get-club.rdo';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';

export class GetClubSlotRdo {
  id: number;

  beginning: string;

  end: string;

  club: GetClubRdo;

  isAvailable?: boolean;

  constructor(slot: ClubSlots, isAvailable?: boolean) {
    this.id = slot.id;
    this.beginning = slot.beginning;
    this.end = slot.end;
    this.club = slot.club ? new GetClubRdo(slot.club) : undefined;
    this.isAvailable = isAvailable;
  }
}
