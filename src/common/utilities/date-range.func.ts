/**
 * Returns dates array.
 * start - dates range start;
 * days - period of days;
 * step - interval between dates.
 **/
export function getDateRange(start: Date, days: number, step = 1): Date[] {
  const dates: Date[] = [];

  for (let i = 0; i <= days; i += step) {
    if (i + step > days) break;
    const newDate = new Date(start);
    newDate.setDate(start.getDate() + i);
    dates.push(newDate);
  }

  return dates;
}
