import { Inject, Injectable } from '@nestjs/common';
import { ChartDataPointDto, GenderDto, GrowthParameterDto } from '@centile-grid/contract';
import { CHART_REPOSITORY, IChartRepository } from './chart.repository';

@Injectable()
export class ChartService {
  constructor(@Inject(CHART_REPOSITORY) private readonly repo: IChartRepository) {}

  getChartData(gender: GenderDto, parameter: GrowthParameterDto): ChartDataPointDto[] {
    return this.repo.findAll(gender, parameter);
  }
}
