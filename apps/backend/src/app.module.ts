import { Module } from '@nestjs/common'
import { HealthModule } from './health/health.module'
import { ChartModule } from './chart/chart.module'

@Module({
  imports: [HealthModule, ChartModule],
})
export class AppModule {}
