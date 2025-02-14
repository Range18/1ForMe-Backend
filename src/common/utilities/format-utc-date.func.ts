const daysOfWeek = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среду',
  'четверг',
  'пятницу',
  'субботу',
] as const;

/**
 * Converts date to message record string.
 **/
export function dateToRecordString(
  date: Date,
  hoursAndMinutes: string,
): string {
  date = new Date(date);
  const dayOfWeek = daysOfWeek[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return `${dayOfMonth}.${month}, ${dayOfWeek}, ${hoursAndMinutes}`;
}
