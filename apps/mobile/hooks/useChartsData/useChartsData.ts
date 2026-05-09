import { useGetChartsDataQuery } from '@/api/hooks/queries/useGetChartsDataQuery';
import { ChartDataPointDto, GenderDto, GrowthParameterDto } from '@centile-grid/contract';
import { LineSeries, ScatterSeries } from '@centile-grid/ui-kit-mobile';

type Metric = {
  parameter: GrowthParameterDto;
  value: number;
};

type ChartData = {
  parameter: GrowthParameterDto;
  lineSeries: LineSeries[];
  scatterSeries: ScatterSeries | undefined;
};

type Input = {
  gender: GenderDto;
  age: number;
  metrics: Metric[];
};

const CENTILE_KEYS = ['c3', 'c10', 'c25', 'c50', 'c75', 'c90', 'c97'] as const;

const toLineSeries = (points: ChartDataPointDto[]): LineSeries[] =>
  CENTILE_KEYS.map((key) => ({
    data: points.map((p) => ({ x: p.age, y: p[key] })),
  }));

export const useChartsData = ({ gender, age, metrics }: Input) => {
  const queries = metrics.map(({ parameter }) => ({ gender, parameter }));
  const results = useGetChartsDataQuery(queries);

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  if (isLoading || isError) {
    return { chartData: undefined, isLoading, isError };
  }

  const chartData: ChartData[] = results.map((result, i) => ({
    parameter: metrics[i].parameter,
    lineSeries: toLineSeries(result.data ?? []),
    scatterSeries: { data: [{ x: age, y: metrics[i].value }] },
  }));

  return { chartData, isLoading: false, isError: false };
};
