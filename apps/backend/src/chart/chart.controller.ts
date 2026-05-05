import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ChartService } from './chart.service';
import { ChartDataPoint, Gender, GENDERS, Parameter, PARAMETERS } from './chart.repository';

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get(':gender/:parameter')
  getChartData(
    @Param('gender') gender: string,
    @Param('parameter') parameter: string,
  ): { data: ChartDataPoint[] } {
    if (!GENDERS.includes(gender as Gender)) {
      throw new NotFoundException();
    }
    if (!PARAMETERS.includes(parameter as Parameter)) {
      throw new NotFoundException();
    }
    return { data: this.chartService.getChartData(gender as Gender, parameter as Parameter) };
  }
}
