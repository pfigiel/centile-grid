export const victoryNativeMock = {
  CartesianChart: ({
    children,
  }: {
    children: (args: { points: Record<string, unknown[]> }) => unknown;
  }) => {
    const points = new Proxy({} as Record<string, unknown[]>, { get: () => [] });
    return children({ points });
  },
  Line: () => null,
  Scatter: () => null,
};
