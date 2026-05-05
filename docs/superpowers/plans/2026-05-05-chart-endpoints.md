# Chart Endpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `GET /chart/:gender/:parameter` endpoints to the NestJS backend, serving centile data parsed from bundled CSV files.

**Architecture:** A `ChartModule` follows the existing NestJS module pattern. `CsvChartRepository` loads all four CSV files at construction and caches them in memory; it implements `IChartRepository`, which `ChartService` depends on via injection token — swapping storage later requires only a new repository class and a token rebind in `ChartModule`.

**Tech Stack:** NestJS 11, TypeScript, Node.js `fs`/`path` modules (no new dependencies)

---

## File Map

| Action | Path                                                   | Responsibility                                                                                                                        |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Move   | `src/female_height.csv` → `src/data/female_height.csv` | CSV data                                                                                                                              |
| Move   | `src/female_weight.csv` → `src/data/female_weight.csv` | CSV data                                                                                                                              |
| Move   | `src/male_height.csv` → `src/data/male_height.csv`     | CSV data                                                                                                                              |
| Move   | `src/male_weight.csv` → `src/data/male_weight.csv`     | CSV data                                                                                                                              |
| Modify | `package.json`                                         | Copy `src/data/` to `dist/data/` on build                                                                                             |
| Create | `src/chart/chart.repository.ts`                        | `ChartDataPoint` type, `Gender`/`Parameter` types, `IChartRepository` interface, `CHART_REPOSITORY` token, `CsvChartRepository` class |
| Create | `src/chart/chart.repository.spec.ts`                   | Tests for `CsvChartRepository`                                                                                                        |
| Create | `src/chart/chart.service.ts`                           | `ChartService` — delegates to repository                                                                                              |
| Create | `src/chart/chart.service.spec.ts`                      | Tests for `ChartService`                                                                                                              |
| Create | `src/chart/chart.controller.ts`                        | `ChartController` — validates params, wraps response                                                                                  |
| Create | `src/chart/chart.controller.spec.ts`                   | Tests for `ChartController`                                                                                                           |
| Create | `src/chart/chart.module.ts`                            | Wires controller, service, and repository token                                                                                       |
| Modify | `src/app.module.ts`                                    | Import `ChartModule`                                                                                                                  |

---

### Task 1: Move CSV files and update build script

**Files:**

- Move: `apps/backend/src/female_height.csv` → `apps/backend/src/data/female_height.csv`
- Move: `apps/backend/src/female_weight.csv` → `apps/backend/src/data/female_weight.csv`
- Move: `apps/backend/src/male_height.csv` → `apps/backend/src/data/male_height.csv`
- Move: `apps/backend/src/male_weight.csv` → `apps/backend/src/data/male_weight.csv`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: Move CSV files**

```bash
cd apps/backend && mkdir -p src/data
mv src/female_height.csv src/data/female_height.csv
mv src/female_weight.csv src/data/female_weight.csv
mv src/male_height.csv src/data/male_height.csv
mv src/male_weight.csv src/data/male_weight.csv
```

- [ ] **Step 2: Update build script to copy CSVs into dist/**

In `apps/backend/package.json`, update the `"build"` script:

```json
"build": "tsc -p tsconfig.build.json && cp -r src/data dist/data"
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/data apps/backend/src/female_height.csv apps/backend/src/female_weight.csv apps/backend/src/male_height.csv apps/backend/src/male_weight.csv apps/backend/package.json
git commit -m "chore(backend): move CSV files to src/data, update build to bundle them"
```

---

### Task 2: Create IChartRepository and CsvChartRepository with tests

**Files:**

- Create: `apps/backend/src/chart/chart.repository.ts`
- Create: `apps/backend/src/chart/chart.repository.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/backend/src/chart/chart.repository.spec.ts`:

```typescript
import { CsvChartRepository } from './chart.repository';

describe('CsvChartRepository', () => {
  let repo: CsvChartRepository;

  beforeEach(() => {
    repo = new CsvChartRepository();
  });

  it('should return 16 rows with correct first row when female height is requested', () => {
    const data = repo.findAll('female', 'height');

    expect(data).toHaveLength(16);
    expect(data[0]).toEqual({
      age: 3,
      c3: 90.0,
      c10: 92.0,
      c25: 94.0,
      c50: 96,
      c75: 98.0,
      c90: 100.0,
      c97: 102.0,
    });
  });

  it('should return 16 rows with correct first row when male height is requested', () => {
    const data = repo.findAll('male', 'height');

    expect(data).toHaveLength(16);
    expect(data[0]).toEqual({
      age: 3,
      c3: 91.0,
      c10: 93.0,
      c25: 95.5,
      c50: 98,
      c75: 100.5,
      c90: 103.0,
      c97: 105.0,
    });
  });

  it('should strip unit suffix from column names when parsing weight CSV', () => {
    const data = repo.findAll('female', 'weight');

    expect(data[0]).toEqual({
      age: 3,
      c3: 11.5,
      c10: 12.5,
      c25: 13.5,
      c50: 14.5,
      c75: 15.5,
      c90: 16.5,
      c97: 18.0,
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/backend && pnpm test -- --testPathPattern=chart.repository
```

Expected: FAIL with `Cannot find module './chart.repository'`

- [ ] **Step 3: Implement chart.repository.ts**

Create `apps/backend/src/chart/chart.repository.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/backend && pnpm test -- --testPathPattern=chart.repository
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/chart/chart.repository.ts apps/backend/src/chart/chart.repository.spec.ts
git commit -m "feat(backend): add IChartRepository interface and CsvChartRepository"
```

---

### Task 3: Create ChartService with tests

**Files:**

- Create: `apps/backend/src/chart/chart.service.ts`
- Create: `apps/backend/src/chart/chart.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/backend/src/chart/chart.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ChartService } from './chart.service';
import { CHART_REPOSITORY, ChartDataPoint, IChartRepository } from './chart.repository';

describe('ChartService', () => {
  let service: ChartService;
  const mockData: ChartDataPoint[] = [
    { age: 3, c3: 90, c10: 92, c25: 94, c50: 96, c75: 98, c90: 100, c97: 102 },
  ];
  const mockRepo: IChartRepository = { findAll: jest.fn().mockReturnValue(mockData) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartService, { provide: CHART_REPOSITORY, useValue: mockRepo }],
    }).compile();

    service = module.get<ChartService>(ChartService);
  });

  it('should delegate to repository when getChartData is called', () => {
    const result = service.getChartData('female', 'height');

    expect(mockRepo.findAll).toHaveBeenCalledWith('female', 'height');
    expect(result).toBe(mockData);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/backend && pnpm test -- --testPathPattern=chart.service
```

Expected: FAIL with `Cannot find module './chart.service'`

- [ ] **Step 3: Implement chart.service.ts**

Create `apps/backend/src/chart/chart.service.ts`:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import {
  IChartRepository,
  ChartDataPoint,
  Gender,
  Parameter,
  CHART_REPOSITORY,
} from './chart.repository';

@Injectable()
export class ChartService {
  constructor(@Inject(CHART_REPOSITORY) private readonly repo: IChartRepository) {}

  getChartData(gender: Gender, parameter: Parameter): ChartDataPoint[] {
    return this.repo.findAll(gender, parameter);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/backend && pnpm test -- --testPathPattern=chart.service
```

Expected: PASS — 1 test passing

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/chart/chart.service.ts apps/backend/src/chart/chart.service.spec.ts
git commit -m "feat(backend): add ChartService"
```

---

### Task 4: Create ChartController with tests

**Files:**

- Create: `apps/backend/src/chart/chart.controller.ts`
- Create: `apps/backend/src/chart/chart.controller.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/backend/src/chart/chart.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ChartController } from './chart.controller';
import { ChartService } from './chart.service';
import { ChartDataPoint, CHART_REPOSITORY } from './chart.repository';

describe('ChartController', () => {
  let controller: ChartController;
  const mockData: ChartDataPoint[] = [
    { age: 3, c3: 90, c10: 92, c25: 94, c50: 96, c75: 98, c90: 100, c97: 102 },
  ];
  const mockChartService = { getChartData: jest.fn().mockReturnValue(mockData) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChartController],
      providers: [{ provide: ChartService, useValue: mockChartService }],
    }).compile();

    controller = module.get<ChartController>(ChartController);
  });

  it('should return data wrapped in data key when gender and parameter are valid', () => {
    const result = controller.getChartData('female', 'height');

    expect(mockChartService.getChartData).toHaveBeenCalledWith('female', 'height');
    expect(result).toEqual({ data: mockData });
  });

  it('should throw NotFoundException when gender is invalid', () => {
    expect(() => controller.getChartData('alien', 'height')).toThrow(NotFoundException);
  });

  it('should throw NotFoundException when parameter is invalid', () => {
    expect(() => controller.getChartData('male', 'bmi')).toThrow(NotFoundException);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/backend && pnpm test -- --testPathPattern=chart.controller
```

Expected: FAIL with `Cannot find module './chart.controller'`

- [ ] **Step 3: Implement chart.controller.ts**

Create `apps/backend/src/chart/chart.controller.ts`:

```typescript
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ChartService } from './chart.service';
import { ChartDataPoint, Gender, Parameter } from './chart.repository';

const VALID_GENDERS: Gender[] = ['male', 'female'];
const VALID_PARAMETERS: Parameter[] = ['height', 'weight'];

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get(':gender/:parameter')
  getChartData(
    @Param('gender') gender: string,
    @Param('parameter') parameter: string,
  ): { data: ChartDataPoint[] } {
    if (!VALID_GENDERS.includes(gender as Gender)) {
      throw new NotFoundException();
    }
    if (!VALID_PARAMETERS.includes(parameter as Parameter)) {
      throw new NotFoundException();
    }
    return { data: this.chartService.getChartData(gender as Gender, parameter as Parameter) };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/backend && pnpm test -- --testPathPattern=chart.controller
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/chart/chart.controller.ts apps/backend/src/chart/chart.controller.spec.ts
git commit -m "feat(backend): add ChartController with 404 for invalid gender/parameter"
```

---

### Task 5: Wire ChartModule into AppModule and run full test suite

**Files:**

- Create: `apps/backend/src/chart/chart.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create chart.module.ts**

Create `apps/backend/src/chart/chart.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ChartController } from './chart.controller';
import { ChartService } from './chart.service';
import { CsvChartRepository, CHART_REPOSITORY } from './chart.repository';

@Module({
  controllers: [ChartController],
  providers: [ChartService, { provide: CHART_REPOSITORY, useClass: CsvChartRepository }],
})
export class ChartModule {}
```

- [ ] **Step 2: Register ChartModule in AppModule**

Edit `apps/backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ChartModule } from './chart/chart.module';

@Module({
  imports: [HealthModule, ChartModule],
})
export class AppModule {}
```

- [ ] **Step 3: Run full test suite**

```bash
cd apps/backend && pnpm test
```

Expected: PASS — all tests across health and chart modules passing

- [ ] **Step 4: Run typecheck**

```bash
cd apps/backend && pnpm typecheck
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/chart/chart.module.ts apps/backend/src/app.module.ts
git commit -m "feat(backend): register ChartModule in AppModule"
```
