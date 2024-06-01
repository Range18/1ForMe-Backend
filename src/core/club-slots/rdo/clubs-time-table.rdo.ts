import { GetClubRdo } from '#src/core/clubs/rdo/get-club.rdo';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';
import { GetSlotForTimeTableRdo } from '#src/core/club-slots/rdo/get-slot-for-time-table.rdo';

export class ClubsTimeTableRdo {
  club: GetClubRdo;

  slots: GetSlotForTimeTableRdo[];

  constructor(club: Clubs, slots: GetSlotForTimeTableRdo[]) {
    this.club = new GetClubRdo(club);
    this.slots = slots;
  }
}
