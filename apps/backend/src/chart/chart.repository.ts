import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { ChartDataPointDto, GenderDto, GrowthParameterDto } from '@centile-grid/contract'

export const GENDERS = ['male', 'female'] satisfies GenderDto[]
export const PARAMETERS = ['height', 'weight'] satisfies GrowthParameterDto[]

export interface IChartRepository {
  findAll(gender: GenderDto, parameter: GrowthParameterDto): ChartDataPointDto[]
}

export const CHART_REPOSITORY = 'CHART_REPOSITORY'

@Injectable()
export class CsvChartRepository implements IChartRepository {
  private readonly cache = new Map<string, ChartDataPointDto[]>()

  constructor() {
    for (const gender of GENDERS) {
      for (const parameter of PARAMETERS) {
        const key = `${gender}_${parameter}`
        const dataDir = process.env.DATA_DIR ?? path.join(__dirname, '..', 'data')
        const filePath = path.join(dataDir, `${key}.csv`)
        const content = fs.readFileSync(filePath, 'utf-8')
        this.cache.set(key, this.parseRows(content))
      }
    }
  }

  findAll(gender: GenderDto, parameter: GrowthParameterDto): ChartDataPointDto[] {
    return this.cache.get(`${gender}_${parameter}`) ?? []
  }

  private parseRows(csvContent: string): ChartDataPointDto[] {
    const [headerLine, ...dataLines] = csvContent
      .trim()
      .split('\n')
      .filter((l) => l.trim().length > 0)
    const headers = headerLine.split(',').map((h) =>
      h
        .trim()
        .replace(/^age_years$/, 'age')
        .replace(/_(?:cm|kg)$/, ''),
    )

    return dataLines.map((line) => {
      const values = line.split(',').map((v) => parseFloat(v.trim()))
      const get = (name: string) => values[headers.indexOf(name)]
      return {
        age: get('age'),
        c3: get('c3'),
        c10: get('c10'),
        c25: get('c25'),
        c50: get('c50'),
        c75: get('c75'),
        c90: get('c90'),
        c97: get('c97'),
      }
    })
  }
}
