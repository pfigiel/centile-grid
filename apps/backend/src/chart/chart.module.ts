import { Module } from '@nestjs/common';
import { ChartController } from './chart.controller';
import { ChartService } from './chart.service';
import { CsvChartRepository, CHART_REPOSITORY } from './chart.repository';

@Module({
  controllers: [ChartController],
  providers: [ChartService, { provide: CHART_REPOSITORY, useClass: CsvChartRepository }],
})
export class ChartModule {}
