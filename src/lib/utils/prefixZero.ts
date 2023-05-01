export default function prefixZero(n: number | string) {
  return +n < 10 ? `0${n}` : `${n}`
}