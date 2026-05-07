import { getChartData } from './getChartData';

const mockDataPoint = { age: 1, c3: 70, c10: 72, c25: 74, c50: 76, c75: 78, c90: 80, c97: 82 };

describe('getChartData', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockReset();
  });

  it('should return chart data when response is ok', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockDataPoint] }),
    } as Response);

    const result = await getChartData('male', 'height');

    expect(fetch).toHaveBeenCalledWith(`${process.env.EXPO_PUBLIC_API_BASE_URL}/chart/male/height`);
    expect(result).toEqual([mockDataPoint]);
  });

  it('should throw when response is not ok', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(getChartData('male', 'height')).rejects.toThrow('Failed to fetch chart data');
  });
});
