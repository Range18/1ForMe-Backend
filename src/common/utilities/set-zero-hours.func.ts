/**
 * Sets Date hours, minutes, seconds, milliseconds to zero.
 **/
export function setZeroHours(date: Date): Date {
  date.setHours(0, 0, 0, 0);
  return date;
}
