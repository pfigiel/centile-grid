import { useQuery } from '@tanstack/react-query';
import { GenderDto, GrowthParameterDto } from '@centile-grid/contract';
import { api } from '../../../index';

export const useGetChartDataQuery = (gender: GenderDto, parameter: GrowthParameterDto) =>
  useQuery({
    queryKey: ['chart', gender, parameter],
    queryFn: () => api.chart(gender, parameter),
  });
