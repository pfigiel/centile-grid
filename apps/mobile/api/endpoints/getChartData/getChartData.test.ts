import { setupServer } from 'msw/node';
import { handlers } from '../../tests/handlers';
import { getChartData } from './getChartData';

const mockDataPoint = { age: 1, c3: 70, c10: 72, c25: 74, c50: 76, c75: 78, c90: 80, c97: 82 };

const server = setupServer(handlers.chart.getChartData.success({ data: [mockDataPoint] }));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getChartData', () => {
  it('should return chart data when response is ok', async () => {
    const result = await getChartData('male', 'height');

    expect(result).toEqual([mockDataPoint]);
  });

  it('should throw when response is not ok', async () => {
    server.use(handlers.chart.getChartData.error());

    await expect(getChartData('male', 'height')).rejects.toThrow('Failed to fetch chart data');
  });
});
