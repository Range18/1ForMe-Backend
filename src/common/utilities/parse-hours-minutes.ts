export function parseHoursMinutes(str: string) {
  return str.split(':').map((element) => Number(element));
}
