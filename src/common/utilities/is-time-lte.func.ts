/**
 * Compares to dates hours and minutes.
 **/
export function isTimeLTE(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getHours() * 60 + dateA.getMinutes() <=
    dateB.getHours() * 60 + dateB.getMinutes()
  );
}
