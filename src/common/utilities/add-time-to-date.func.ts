import { parseHoursMinutes } from '#src/common/utilities/parse-hours-minutes.func';

/**
 * Adds time string to date.
 **/
export function addTimeToDate(time: string) {
  const currentDate = new Date();
  const [hours, minutes, seconds] = parseHoursMinutes(time);
  currentDate.setHours(hours, minutes, seconds);
  return currentDate;
}
