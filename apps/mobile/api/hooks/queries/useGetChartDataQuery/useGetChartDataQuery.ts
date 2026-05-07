import { Gender, GrowthParameter } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../index';

export const useGetChartDataQuery = (gender: Gender, parameter: GrowthParameter) =>
  useQuery({
    queryKey: ['chart', gender, parameter],
    queryFn: () => api.chart(gender, parameter),
  });
