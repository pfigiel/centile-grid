import { http, HttpResponse } from 'msw'
import { ChartDataPointDto } from '@centile-grid/contract'

export const getChartData = {
  success: (overrides?: { data?: ChartDataPointDto[] }) =>
    http.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/chart/:gender/:parameter`, () =>
      HttpResponse.json({ data: overrides?.data ?? [] }),
    ),

  error: (overrides?: { status?: number }) =>
    http.get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/chart/:gender/:parameter`,
      () => new HttpResponse(null, { status: overrides?.status ?? 500 }),
    ),
}
