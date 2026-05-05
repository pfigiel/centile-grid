import { Inject, Injectable } from '@nestjs/common';
import { CHART_REPOSITORY, ChartDataPoint, IChartRepository } from './chart.repository';
import { Gender, GrowthParameter } from './types';

@Injectable()
export class ChartService {
  constructor(@Inject(CHART_REPOSITORY) private readonly repo: IChartRepository) {}

  getChartData(gender: Gender, parameter: GrowthParameter): ChartDataPoint[] {
    return this.repo.findAll(gender, parameter);
  }
}
