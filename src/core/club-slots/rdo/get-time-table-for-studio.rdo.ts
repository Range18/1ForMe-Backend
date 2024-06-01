import { GetSlotForTimeTableRdo } from '#src/core/club-slots/rdo/get-slot-for-time-table.rdo';

export class GetTimeTableForStudioRdo {
  date: string;

  clubsTimeTable: GetSlotForTimeTableRdo[];

  constructor(date: string, clubsTimeTable: GetSlotForTimeTableRdo[]) {
    this.date = date;
    this.clubsTimeTable = clubsTimeTable;
  }
}
