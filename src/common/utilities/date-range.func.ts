export function getDateRange(start: Date, days: number, plus = 1): Date[] {
  const dates: Date[] = [];

  for (let i = 0; i <= days; i += plus) {
    if (i + plus > days) break;
    const newDate = new Date(start);
    newDate.setDate(start.getDate() + i);
    dates.push(newDate);
  }

  return dates;
}
