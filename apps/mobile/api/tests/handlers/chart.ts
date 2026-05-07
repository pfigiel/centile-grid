import { http, HttpResponse } from 'msw';
import { ChartDataPointDto } from '@centile-grid/contract';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const getChartData = {
  success: (overrides?: { data?: ChartDataPointDto[] }) =>
    http.get(`${BASE_URL}/chart/:gender/:parameter`, () =>
      HttpResponse.json({ data: overrides?.data ?? [] }),
    ),

  error: (overrides?: { status?: number }) =>
    http.get(
      `${BASE_URL}/chart/:gender/:parameter`,
      () => new HttpResponse(null, { status: overrides?.status ?? 500 }),
    ),
};
