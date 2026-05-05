import { Test, TestingModule } from '@nestjs/testing';
import { ChartService } from './chart.service';
import { CHART_REPOSITORY, ChartDataPoint, IChartRepository } from './chart.repository';

describe('ChartService', () => {
  let service: ChartService;
  const mockData: ChartDataPoint[] = [
    { age: 3, c3: 90, c10: 92, c25: 94, c50: 96, c75: 98, c90: 100, c97: 102 },
  ];
  const mockRepo: IChartRepository = { findAll: jest.fn().mockReturnValue(mockData) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartService, { provide: CHART_REPOSITORY, useValue: mockRepo }],
    }).compile();

    service = module.get<ChartService>(ChartService);
  });

  it('should delegate to repository when getChartData is called', () => {
    const result = service.getChartData('female', 'height');

    expect(mockRepo.findAll).toHaveBeenCalledWith('female', 'height');
    expect(result).toBe(mockData);
  });
});
