import { api } from '@/api';
import { Gender, GrowthParameter } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useGetChartDataQuery = (gender: Gender, parameter: GrowthParameter) =>
  useQuery({
    queryKey: ['chart', gender, parameter],
    queryFn: () => api.chart(gender, parameter),
  });
