/**
 * Formates date to YYYY-MM-DDTHH24:MI:SS+GMT string
 *
 * Example: 2016-08-31T12:28:00+03:00
 **/
export function formatDateWithGmt(date: Date): string {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
  return date.toISOString().slice(0, 19) + sign + hours + ':' + minutes;
}
