import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ChartService } from './chart.service';
import { ChartDataPoint, Gender, Parameter } from './chart.repository';

const VALID_GENDERS: Gender[] = ['male', 'female'];
const VALID_PARAMETERS: Parameter[] = ['height', 'weight'];

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get(':gender/:parameter')
  getChartData(
    @Param('gender') gender: string,
    @Param('parameter') parameter: string,
  ): { data: ChartDataPoint[] } {
    if (!VALID_GENDERS.includes(gender as Gender)) {
      throw new NotFoundException();
    }
    if (!VALID_PARAMETERS.includes(parameter as Parameter)) {
      throw new NotFoundException();
    }
    return { data: this.chartService.getChartData(gender as Gender, parameter as Parameter) };
  }
}
