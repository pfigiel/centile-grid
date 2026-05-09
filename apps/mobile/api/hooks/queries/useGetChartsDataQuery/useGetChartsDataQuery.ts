import { api } from '@/api'
import { GenderDto, GrowthParameterDto } from '@centile-grid/contract'
import { useQueries } from '@tanstack/react-query'

type Query = {
  gender: GenderDto
  parameter: GrowthParameterDto
}

export const useGetChartsDataQuery = (queries: Query[]) =>
  useQueries({
    queries: queries.map(({ gender, parameter }) => ({
      queryKey: ['chart', gender, parameter],
      queryFn: () => api.chart(gender, parameter),
    })),
  })
