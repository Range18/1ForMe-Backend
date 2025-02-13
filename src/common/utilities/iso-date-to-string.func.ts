/**
 * Converts date to locale at Russia date string.
 **/
export function ISODateToString(date: Date, includeYear = true) {
  return includeYear
    ? `${date.toLocaleDateString('ru', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })}`
    : `${date.toLocaleDateString('ru', {
        month: '2-digit',
        day: '2-digit',
      })}`;
}
