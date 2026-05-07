import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { handlers } from '../../../tests/handlers';
import { useGetChartDataQuery } from './useGetChartDataQuery';

const mockDataPoint = { age: 1, c3: 70, c10: 72, c25: 74, c50: 76, c75: 78, c90: 80, c97: 82 };

const server = setupServer(handlers.chart.getChartData.success({ data: [mockDataPoint] }));

describe('useGetChartDataQuery', () => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false } },
        })
      }
    >
      {children}
    </QueryClientProvider>
  );

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should return chart data when query succeeds', async () => {
    const { result } = renderHook(() => useGetChartDataQuery('male', 'height'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([mockDataPoint]);
  });
});
