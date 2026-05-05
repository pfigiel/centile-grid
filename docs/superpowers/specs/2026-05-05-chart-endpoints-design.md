# Chart Endpoints Design

**Date:** 2026-05-05  
**Task:** TASK-11 — Add chart endpoints

## Overview

Extend the NestJS backend with a `ChartModule` that exposes `GET /chart/:gender/:parameter` endpoints serving centile data parsed from bundled CSV files. A thin repository abstraction decouples data access from service logic so the storage layer can be swapped (e.g. to a database) without touching existing service code.

## Endpoints

```
GET /chart/:gender/:parameter
```

- `:gender` — `male` | `female`
- `:parameter` — `height` | `weight` (more may be added in future)
- Returns `404 Not Found` for any unrecognised gender or parameter value

### Response shape

```json
{
  "data": [
    {
      "age": 3,
      "c3": 90.0,
      "c10": 92.0,
      "c25": 94.0,
      "c50": 96.0,
      "c75": 98.0,
      "c90": 100.0,
      "c97": 102.0
    }
  ]
}
```

CSV column mapping: `age_years → age`; `c3_cm` / `c3_kg` → `c3`; same pattern for c10, c25, c50, c75, c90, c97.

## Architecture

```
ChartModule
  ChartController        HTTP routing and input validation
  ChartService           Business logic; depends on IChartRepository
  IChartRepository       Interface (TypeScript interface)
  CsvChartRepository     Concrete impl: reads and parses CSVs at construction
```

`ChartService` is injected with `IChartRepository` via NestJS DI using a custom injection token. Replacing the storage layer requires only a new repository class and a token rebind in `ChartModule` — no service changes.

## Data flow

1. Request arrives at `ChartController`
2. Controller validates `:gender` ∈ `{male, female}` and `:parameter` ∈ `{height, weight}`; throws `NotFoundException` on invalid values
3. Controller calls `ChartService.getChartData(gender, parameter)`
4. Service delegates to `IChartRepository.findAll(gender, parameter)`
5. `CsvChartRepository` returns pre-parsed in-memory data (loaded once at module initialisation)
6. Controller wraps result: `{ data: result }`

## CSV files

Moved from `src/` to `src/data/` for cleaner structure:

```
apps/backend/src/data/
  female_height.csv
  female_weight.csv
  male_height.csv
  male_weight.csv
```

A build script (added to `package.json`) copies `src/data/*.csv` → `dist/data/` so files are available at runtime. `CsvChartRepository` resolves paths with `path.join(__dirname, '../data', filename)`, which works both locally and in Lambda (`/var/task/dist/`).

## File structure

```
apps/backend/src/chart/
  chart.module.ts
  chart.controller.ts
  chart.controller.spec.ts
  chart.service.ts
  chart.service.spec.ts
  chart.repository.ts        IChartRepository interface + CsvChartRepository class
  chart.repository.spec.ts
```

## Testing

- **`chart.repository.spec.ts`** — unit tests `CsvChartRepository`: loads real CSV files, verifies column mapping (`age_years → age`, strip unit suffix), correct row count
- **`chart.service.spec.ts`** — unit tests `ChartService` with a mock `IChartRepository`; verifies delegation
- **`chart.controller.spec.ts`** — unit tests `ChartController`: 200 response with wrapped data, 404 for invalid gender, 404 for invalid parameter

## Error handling

| Condition            | Response                      |
| -------------------- | ----------------------------- |
| Invalid `:gender`    | 404 Not Found                 |
| Invalid `:parameter` | 404 Not Found                 |
| Valid inputs         | 200 OK with `{ data: [...] }` |
