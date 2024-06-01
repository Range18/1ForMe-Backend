import { GetClubScheduleRdo } from '#src/core/club-slots/rdo/get-club-schedule.rdo';

export class GetTimeTableForStudioRdo {
  date: string;

  clubsTimeTable: GetClubScheduleRdo[];

  constructor(date: string, clubsTimeTable: GetClubScheduleRdo[]) {
    this.date = date;
    this.clubsTimeTable = clubsTimeTable;
  }
}
