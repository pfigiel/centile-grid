import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Gender, GrowthParameter } from './types';

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

export const GENDERS = ['male', 'female'] satisfies Gender[];
export const PARAMETERS = ['height', 'weight'] satisfies GrowthParameter[];

export interface IChartRepository {
  findAll(gender: Gender, parameter: GrowthParameter): ChartDataPoint[];
}

export const CHART_REPOSITORY = 'CHART_REPOSITORY';

@Injectable()
export class CsvChartRepository implements IChartRepository {
  private readonly cache = new Map<string, ChartDataPoint[]>();

  constructor() {
    for (const gender of GENDERS) {
      for (const parameter of PARAMETERS) {
        const key = `${gender}_${parameter}`;
        const filePath = path.join(__dirname, '..', 'data', `${key}.csv`);
        const content = fs.readFileSync(filePath, 'utf-8');
        this.cache.set(key, this.parseRows(content));
      }
    }
  }

  findAll(gender: Gender, parameter: GrowthParameter): ChartDataPoint[] {
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
