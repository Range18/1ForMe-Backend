import { GetClubSlotRdo } from '#src/core/studio-slots/rdo/get-club-slot.rdo';
import { GetClubRdo } from '#src/core/clubs/rdo/get-club.rdo';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';

export class GetSlotsForStudio {
  date: Date;

  club: GetClubRdo;

  clubSlots: GetClubSlotRdo[];

  constructor(date: Date, club: Clubs, clubSlots: GetClubSlotRdo[]) {
    this.date = date;
    this.club = new GetClubRdo(club);
    this.clubSlots = clubSlots;
  }
}
