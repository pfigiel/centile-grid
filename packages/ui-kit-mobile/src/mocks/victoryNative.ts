export const victoryNativeMock = {
  CartesianChart: ({
    children,
  }: {
    children: (args: {
      points: Record<string, unknown[]>
      chartBounds: { left: number; right: number; top: number; bottom: number }
    }) => unknown
  }) => {
    const points = new Proxy({} as Record<string, unknown[]>, { get: () => [] })
    const chartBounds = { left: 0, right: 100, top: 0, bottom: 100 }
    return children({ points, chartBounds })
  },
  Line: () => null,
  Scatter: () => null,
}
