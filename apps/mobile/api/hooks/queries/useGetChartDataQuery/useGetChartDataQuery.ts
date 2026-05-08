import { api } from '@/api';
import { GenderDto, GrowthParameterDto } from '@centile-grid/contract';
import { useQuery } from '@tanstack/react-query';

export const useGetChartDataQuery = (gender: GenderDto, parameter: GrowthParameterDto) =>
  useQuery({
    queryKey: ['chart', gender, parameter],
    queryFn: () => api.chart(gender, parameter),
  });
