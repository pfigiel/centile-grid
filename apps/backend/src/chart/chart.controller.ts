import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ChartDataPointDto, GenderDto, GrowthParameterDto } from '@centile-grid/contract';
import { GENDERS, PARAMETERS } from './chart.repository';
import { ChartService } from './chart.service';

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get(':gender/:parameter')
  getChartData(
    @Param('gender') gender: GenderDto,
    @Param('parameter') parameter: GrowthParameterDto,
  ): { data: ChartDataPointDto[] } {
    if (!GENDERS.includes(gender)) {
      throw new NotFoundException();
    }
    if (!PARAMETERS.includes(parameter)) {
      throw new NotFoundException();
    }
    return { data: this.chartService.getChartData(gender, parameter) };
  }
}
