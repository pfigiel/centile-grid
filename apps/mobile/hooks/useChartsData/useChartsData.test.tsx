import { handlers } from '@/api/tests/handlers';
import { TestQueryClientProvider } from '@/test/providers/TestQueryClientProvider';
import { renderHook, waitFor } from '@testing-library/react-native';
import { setupServer } from 'msw/node';
import { useChartsData } from './useChartsData';

const mockDataPoint = {
  age: 5,
  c3: 100,
  c10: 105,
  c25: 110,
  c50: 115,
  c75: 120,
  c90: 125,
  c97: 130,
};

const server = setupServer(handlers.chart.getChartData.success({ data: [mockDataPoint] }));

describe('useChartsData', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  const renderHookWithProviders = () =>
    renderHook(
      () =>
        useChartsData({
          gender: 'male',
          age: 5,
          metrics: [{ parameter: 'height', value: 112 }],
        }),
      { wrapper: TestQueryClientProvider },
    );

  it('should map DTO to 7 line series with correct x/y values when data loaded successfully', async () => {
    const { result } = renderHookWithProviders();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.chartData).toHaveLength(1);
    const { lineSeries } = result.current.chartData![0];
    expect(lineSeries).toHaveLength(7);
    expect(lineSeries[0].data).toEqual([{ x: mockDataPoint.age, y: mockDataPoint.c3 }]);
    expect(lineSeries[1].data).toEqual([{ x: mockDataPoint.age, y: mockDataPoint.c10 }]);
    expect(lineSeries[2].data).toEqual([{ x: mockDataPoint.age, y: mockDataPoint.c25 }]);
    expect(lineSeries[3].data).toEqual([{ x: mockDataPoint.age, y: mockDataPoint.c50 }]);
    expect(lineSeries[4].data).toEqual([{ x: mockDataPoint.age, y: mockDataPoint.c75 }]);
    expect(lineSeries[5].data).toEqual([{ x: mockDataPoint.age, y: mockDataPoint.c90 }]);
    expect(lineSeries[6].data).toEqual([{ x: mockDataPoint.age, y: mockDataPoint.c97 }]);
  });

  it('should build scatter series with patient age and metric value when data loaded successfully', async () => {
    const { result } = renderHookWithProviders();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const { scatterSeries } = result.current.chartData![0];
    expect(scatterSeries).toEqual({ data: [{ x: 5, y: 112 }] });
  });

  it('should return undefined chartData when loading', () => {
    const { result } = renderHookWithProviders();

    expect(result.current.isLoading).toBe(true);
    expect(result.current.chartData).toBeUndefined();
  });

  it('should return isError true and undefined chartData when request fails', async () => {
    server.use(handlers.chart.getChartData.error());

    const { result } = renderHookWithProviders();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.chartData).toBeUndefined();
  });
});
