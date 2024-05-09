export function ISODateToString(date: Date) {
  return `${date.toLocaleDateString('ru', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })}`;
}
