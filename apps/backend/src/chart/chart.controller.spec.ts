import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChartDataPointDto, GenderDto, GrowthParameterDto } from '@centile-grid/contract';
import { ChartController } from './chart.controller';
import { ChartService } from './chart.service';

describe('ChartController', () => {
  let controller: ChartController;
  const mockData: ChartDataPointDto[] = [
    { age: 3, c3: 90, c10: 92, c25: 94, c50: 96, c75: 98, c90: 100, c97: 102 },
  ];
  const mockChartService = { getChartData: jest.fn().mockReturnValue(mockData) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChartController],
      providers: [{ provide: ChartService, useValue: mockChartService }],
    }).compile();

    controller = module.get<ChartController>(ChartController);
  });

  it('should return data wrapped in data key when gender and parameter are valid', () => {
    const result = controller.getChartData('female', 'height');

    expect(mockChartService.getChartData).toHaveBeenCalledWith('female', 'height');
    expect(result).toEqual({ data: mockData });
  });

  it('should throw NotFoundException when gender is invalid', () => {
    expect(() => controller.getChartData('alien' as GenderDto, 'height')).toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when parameter is invalid', () => {
    expect(() => controller.getChartData('male', 'bmi' as GrowthParameterDto)).toThrow(
      NotFoundException,
    );
  });
});
