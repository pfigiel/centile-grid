import { Injectable, Inject } from '@nestjs/common';
import {
  IChartRepository,
  ChartDataPoint,
  Gender,
  Parameter,
  CHART_REPOSITORY,
} from './chart.repository';

@Injectable()
export class ChartService {
  constructor(@Inject(CHART_REPOSITORY) private readonly repo: IChartRepository) {}

  getChartData(gender: Gender, parameter: Parameter): ChartDataPoint[] {
    return this.repo.findAll(gender, parameter);
  }
}
