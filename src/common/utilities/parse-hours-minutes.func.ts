/**
 * Parses string to hours, minutes, seconds.
 **/
export function parseHoursMinutes(str: string): number[] {
  return str.split(':').map((element) => Number(element));
}
