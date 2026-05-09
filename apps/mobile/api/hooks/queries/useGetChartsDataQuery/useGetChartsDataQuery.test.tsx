import { handlers } from '@/api/tests/handlers';
import { TestQueryClientProvider } from '@/test/providers/TestQueryClientProvider';
import { renderHook, waitFor } from '@testing-library/react-native';
import { setupServer } from 'msw/node';
import { useGetChartsDataQuery } from './useGetChartsDataQuery';

const mockHeightPoint = { age: 1, c3: 70, c10: 72, c25: 74, c50: 76, c75: 78, c90: 80, c97: 82 };

const server = setupServer(handlers.chart.getChartData.success({ data: [mockHeightPoint] }));

describe('useGetChartsDataQuery', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('returns data for single query', async () => {
    const { result } = renderHook(
      () => useGetChartsDataQuery([{ gender: 'male', parameter: 'height' }]),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current[0].isSuccess).toBe(true));

    expect(result.current[0].data).toEqual([mockHeightPoint]);
  });

  it('returns data for multiple queries', async () => {
    server.use(handlers.chart.getChartData.success({ data: [mockHeightPoint] }));

    const { result } = renderHook(
      () =>
        useGetChartsDataQuery([
          { gender: 'male', parameter: 'height' },
          { gender: 'male', parameter: 'weight' },
        ]),
      { wrapper: TestQueryClientProvider },
    );
    await waitFor(() => expect(result.current.every((r) => r.isSuccess)).toBe(true));

    expect(result.current).toHaveLength(2);
    expect(result.current[0].data).toEqual([mockHeightPoint]);
    expect(result.current[1].data).toEqual([mockHeightPoint]);
  });
});
