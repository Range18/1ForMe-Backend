import { GetClubRdo } from '#src/core/clubs/rdo/get-club.rdo';
import { ClubSlots } from '#src/core/club-slots/entities/club-slot.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';

export class GetClubSlotRdo {
  id: number;

  beginning: string;

  end: string;

  club: GetClubRdo;

  isAvailable?: boolean;

  constructor(slot: ClubSlots, isAvailable?: boolean, club?: Clubs) {
    this.id = slot.id;
    this.beginning = slot.beginning;
    this.end = slot.end;
    this.club = club ? new GetClubRdo(club) : undefined;
    this.isAvailable = isAvailable;
  }
}
