import { getCentileLabel } from './getCentileLabel'

type DataPoint = { x: number; y: number }

const makeSeries = (
  age: number,
  centiles: [number, number, number, number, number, number, number],
): DataPoint[][] => centiles.map((y) => [{ x: age, y }])

describe('getCentileLabel', () => {
  const baseSeries = makeSeries(5, [10, 12, 14, 16, 18, 20, 22])

  it('should return exact centile label when value equals centile threshold', () => {
    expect(getCentileLabel(baseSeries, 5, 16)).toBe('c50')
  })

  it('should return c3 when value equals c3 threshold', () => {
    expect(getCentileLabel(baseSeries, 5, 10)).toBe('c3')
  })

  it('should return c97 when value equals c97 threshold', () => {
    expect(getCentileLabel(baseSeries, 5, 22)).toBe('c97')
  })

  it('should return centile range when value falls between two thresholds', () => {
    expect(getCentileLabel(baseSeries, 5, 17)).toBe('c50 - c75')
  })

  it('should return < c3 when value is below c3 threshold', () => {
    expect(getCentileLabel(baseSeries, 5, 9)).toBe('< c3')
  })

  it('should return > c97 when value is above c97 threshold', () => {
    expect(getCentileLabel(baseSeries, 5, 23)).toBe('> c97')
  })

  it('should interpolate centile thresholds when age falls between data points', () => {
    const series: DataPoint[][] = [
      [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
      ], // c3
      [
        { x: 10, y: 12 },
        { x: 11, y: 12 },
      ], // c10
      [
        { x: 10, y: 14 },
        { x: 11, y: 14 },
      ], // c25
      [
        { x: 10, y: 16 },
        { x: 11, y: 18 },
      ], // c50: 17 at age 10.5
      [
        { x: 10, y: 18 },
        { x: 11, y: 20 },
      ], // c75: 19 at age 10.5
      [
        { x: 10, y: 20 },
        { x: 11, y: 20 },
      ], // c90
      [
        { x: 10, y: 22 },
        { x: 11, y: 22 },
      ], // c97
    ]
    expect(getCentileLabel(series, 10.5, 17)).toBe('c50')
  })

  it('should return range based on interpolated thresholds at fractional age', () => {
    const series: DataPoint[][] = [
      [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
      ],
      [
        { x: 10, y: 12 },
        { x: 11, y: 12 },
      ],
      [
        { x: 10, y: 14 },
        { x: 11, y: 14 },
      ],
      [
        { x: 10, y: 16 },
        { x: 11, y: 18 },
      ], // c50: 17 at age 10.5
      [
        { x: 10, y: 18 },
        { x: 11, y: 20 },
      ], // c75: 19 at age 10.5
      [
        { x: 10, y: 20 },
        { x: 11, y: 20 },
      ],
      [
        { x: 10, y: 22 },
        { x: 11, y: 22 },
      ],
    ]
    // value 18 is between interpolated c50=17 and c75=19
    expect(getCentileLabel(series, 10.5, 18)).toBe('c50 - c75')
  })

  it('should return - when age exceeds maximum data point age', () => {
    expect(getCentileLabel(baseSeries, 6, 16)).toBe('-')
  })

  it('should return - when age is below minimum data point age', () => {
    expect(getCentileLabel(baseSeries, 4, 16)).toBe('-')
  })
})
