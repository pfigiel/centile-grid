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

export const GENDERS = ['male', 'female'] as const;
export const PARAMETERS = ['height', 'weight'] as const;
export type Gender = (typeof GENDERS)[number];
export type Parameter = (typeof PARAMETERS)[number];

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
    const [headerLine, ...dataLines] = csvContent
      .trim()
      .split('\n')
      .filter((l) => l.trim().length > 0);
    const headers = headerLine.split(',').map((h) =>
      h
        .trim()
        .replace(/^age_years$/, 'age')
        .replace(/_(?:cm|kg)$/, ''),
    );

    return dataLines.map((line) => {
      const values = line.split(',').map((v) => parseFloat(v.trim()));
      const get = (name: string) => values[headers.indexOf(name)];
      return {
        age: get('age'),
        c3: get('c3'),
        c10: get('c10'),
        c25: get('c25'),
        c50: get('c50'),
        c75: get('c75'),
        c90: get('c90'),
        c97: get('c97'),
      };
    });
  }
}
