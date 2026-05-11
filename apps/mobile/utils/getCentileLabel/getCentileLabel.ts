type DataPoint = { x: number; y: number }

const CENTILE_KEYS = ['c3', 'c10', 'c25', 'c50', 'c75', 'c90', 'c97'] as const

const lerp = (y0: number, y1: number, x0: number, x1: number, x: number): number =>
  y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)

const getValueAtAge = (points: DataPoint[], age: number): number | undefined => {
  const sorted = [...points].sort((a, b) => a.x - b.x)
  if (age < sorted[0].x || age > sorted[sorted.length - 1].x) return undefined

  const ceilIdx = sorted.findIndex((p) => p.x >= age)
  if (sorted[ceilIdx].x === age) return sorted[ceilIdx].y

  const lower = sorted[ceilIdx - 1]
  const upper = sorted[ceilIdx]
  return lerp(lower.y, upper.y, lower.x, upper.x, age)
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
