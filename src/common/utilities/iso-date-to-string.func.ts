/**
 * Converts date to locale at Russia date string.
 **/
export function ISODateToString(date: Date) {
  return `${date.toLocaleDateString('ru', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })}`;
}
