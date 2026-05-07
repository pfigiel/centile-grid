import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';
import { api } from '../../../index';
import { useGetChartDataQuery } from './useGetChartDataQuery';

jest.mock('../../../index', () => ({
  api: {
    chart: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

const mockDataPoint = { age: 1, c3: 70, c10: 72, c25: 74, c50: 76, c75: 78, c90: 80, c97: 82 };

describe('useGetChartDataQuery', () => {
  it('should return chart data when query succeeds', async () => {
    (api.chart as jest.Mock).mockResolvedValueOnce([mockDataPoint]);

    const { result } = renderHook(() => useGetChartDataQuery('male', 'height'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([mockDataPoint]);
    expect(api.chart).toHaveBeenCalledWith('male', 'height');
  });
});
