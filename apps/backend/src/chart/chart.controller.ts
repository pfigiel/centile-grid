import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ChartDataPoint, GENDERS, PARAMETERS } from './chart.repository';
import { ChartService } from './chart.service';
import { Gender, GrowthParameter } from './types';

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get(':gender/:parameter')
  getChartData(
    @Param('gender') gender: Gender,
    @Param('parameter') parameter: GrowthParameter,
  ): { data: ChartDataPoint[] } {
    if (!GENDERS.includes(gender)) {
      throw new NotFoundException();
    }
    if (!PARAMETERS.includes(parameter)) {
      throw new NotFoundException();
    }
    return { data: this.chartService.getChartData(gender, parameter) };
  }
}
