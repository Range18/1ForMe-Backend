export function addTimeToStr(date: Date, n: number): string {
  const newDate = new Date(date.getTime() + n);

  return `${newDate.toLocaleDateString('ru', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })}`;
}
