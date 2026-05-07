import { ChartDataPointDto, GenderDto, GrowthParameterDto } from '@centile-grid/contract';

export const getChartData = async (
  gender: GenderDto,
  parameter: GrowthParameterDto,
): Promise<ChartDataPointDto[]> => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error('EXPO_PUBLIC_API_BASE_URL is not set');
  const response = await fetch(`${baseUrl}/chart/${gender}/${parameter}`);
  if (!response.ok) {
    throw new Error('Failed to fetch chart data');
  }
  const { data } = await response.json();
  return data;
};
