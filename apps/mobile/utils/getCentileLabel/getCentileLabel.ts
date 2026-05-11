type DataPoint = { x: number; y: number }

const CENTILE_KEYS = ['c3', 'c10', 'c25', 'c50', 'c75', 'c90', 'c97'] as const

const interpolateLinear = (y0: number, y1: number, x0: number, x1: number, x: number): number =>
  y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)

const getValueAtAge = (points: DataPoint[], age: number): number | undefined => {
  if (age < points[0].x || age > points[points.length - 1].x) return undefined

  const ceilIdx = points.findIndex((p) => p.x >= age)
  if (points[ceilIdx].x === age) return points[ceilIdx].y

  const lower = points[ceilIdx - 1]
  const upper = points[ceilIdx]
  return interpolateLinear(lower.y, upper.y, lower.x, upper.x, age)
}

export const getCentileLabel = (series: DataPoint[][], age: number, value: number): string => {
  const values = series.map((s) => getValueAtAge(s, age))
  if (values.some((v) => v === undefined)) return '-'

  const centiles = values as number[]

  if (value < centiles[0]) return '< c3'
  if (value > centiles[6]) return '> c97'

  for (let i = 0; i < CENTILE_KEYS.length; i++) {
    if (value === centiles[i]) return CENTILE_KEYS[i]
    if (i < CENTILE_KEYS.length - 1 && value < centiles[i + 1]) {
      return `${CENTILE_KEYS[i]} - ${CENTILE_KEYS[i + 1]}`
    }
  }

  return 'c97'
}
