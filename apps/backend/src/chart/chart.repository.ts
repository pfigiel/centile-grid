import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

export interface ChartDataPoint {
  age: number;
  c3: number;
  c10: number;
  c25: number;
  c50: number;
  c75: number;
  c90: number;
  c97: number;
}

export type Gender = 'male' | 'female';
export type Parameter = 'height' | 'weight';

export interface IChartRepository {
  findAll(gender: Gender, parameter: Parameter): ChartDataPoint[];
}

export const CHART_REPOSITORY = 'CHART_REPOSITORY';

@Injectable()
export class CsvChartRepository implements IChartRepository {
  private readonly cache = new Map<string, ChartDataPoint[]>();

  constructor() {
    const genders: Gender[] = ['male', 'female'];
    const parameters: Parameter[] = ['height', 'weight'];
    for (const gender of genders) {
      for (const parameter of parameters) {
        const key = `${gender}_${parameter}`;
        const filePath = path.join(__dirname, '..', 'data', `${key}.csv`);
        const content = fs.readFileSync(filePath, 'utf-8');
        this.cache.set(key, this.parseRows(content));
      }
    }
  }

  findAll(gender: Gender, parameter: Parameter): ChartDataPoint[] {
    return this.cache.get(`${gender}_${parameter}`) ?? [];
  }

  private parseRows(csvContent: string): ChartDataPoint[] {
    const [headerLine, ...dataLines] = csvContent.trim().split('\n');
    const headers = headerLine.split(',').map((h) =>
      h
        .trim()
        .replace(/^age_years$/, 'age')
        .replace(/_(?:cm|kg)$/, ''),
    );

    return dataLines.map((line) => {
      const values = line.split(',').map((v) => parseFloat(v.trim()));
      const point: Record<string, number> = {};
      headers.forEach((h, i) => {
        point[h] = values[i];
      });
      return point as unknown as ChartDataPoint;
    });
  }
}
