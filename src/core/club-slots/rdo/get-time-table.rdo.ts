import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';
import { GetTimeTableForStudioRdo } from '#src/core/club-slots/rdo/get-time-table-for-studio.rdo';
import { Studio } from '#src/core/studios/entities/studio.entity';

export class GetTimeTableRdo {
  studio: GetStudioRdo;

  timeTable: GetTimeTableForStudioRdo[];

  constructor(studio: Studio, timeTable: GetTimeTableForStudioRdo[]) {
    this.studio = new GetStudioRdo(studio);
    this.timeTable = timeTable;
  }
}
