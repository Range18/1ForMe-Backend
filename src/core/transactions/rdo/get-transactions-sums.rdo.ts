import { ISODateToString } from '#src/common/utilities/iso-date-to-string.func';

export class GetTransactionSumsRdo {
  costSum: number;

  day?: number;

  week?: number;

  month: number;

  year: number;

  weekDates: { start: string; end: string };

  date?: string;

  private getWeekDates(weekNumber: number, year: number) {
    // Определяем дату начала года
    const startDate = new Date(year, 0, 1);

    // Добавляем количество недель к дате начала года
    const weekStart = new Date(
      startDate.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000,
    );

    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

    return {
      start: ISODateToString(weekStart),
      end: ISODateToString(weekEnd),
    };
  }

  constructor(
    entity: {
      costSum: number;
      day?: number;
      week?: number;
      month: number;
      year: number;
      date?: string;
    },
    tax?: number,
  ) {
    const date = entity.date ? new Date(entity.date) : undefined;
    this.costSum = tax ? entity.costSum * (1 - tax / 100) : entity.costSum;
    this.day = entity.day;
    this.month = entity.month;
    this.date = date ? ISODateToString(date) : undefined;
    this.weekDates = entity.week
      ? this.getWeekDates(entity.week, entity.year)
      : undefined;
    this.week = entity.week;
    this.year = entity.year;
  }
}
