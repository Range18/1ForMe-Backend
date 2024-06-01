export function getDateRange(start: Date, days: number): Date[] {
  const dates: Date[] = [];

  for (let i = 0; i <= days; i++) {
    const newDate = new Date(start);
    newDate.setDate(start.getDate() + i);
    dates.push(newDate);
  }

  return dates;
}
