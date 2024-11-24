import { parseHoursMinutes } from '#src/common/utilities/parse-hours-minutes';

export function TimeToDate(time: string) {
  const currentDate = new Date();
  const [hours, minutes, seconds] = parseHoursMinutes(time);
  currentDate.setHours(hours, minutes, seconds);
  return currentDate;
}
