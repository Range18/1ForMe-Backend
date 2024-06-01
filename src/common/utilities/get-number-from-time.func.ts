import { parseHoursMinutes } from '#src/common/utilities/parse-hours-minutes';

export function GetNumberFromTime(time: string) {
  const [hours, minutes] = parseHoursMinutes(time);

  return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
}
