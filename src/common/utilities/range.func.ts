export function range(from: number, to: number) {
  return [...Array(to - from + 1).keys()].map((i) => i + from);
}
