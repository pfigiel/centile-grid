---
id: TASK-12
title: Set up API integration layer
status: In Progress
assignee: []
created_date: '2026-05-07 08:54'
updated_date: '2026-05-07 08:54'
labels: []
dependencies: []
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Set up an API integration layer in apps/mobile. It should consist of 2 parts - endpoint definitions and query hooks. Both parts should live in apps/mobile/api.

Endpoint definitions should be defined in apps/mobile/api/endpoints. Each endpoint should be a self-sufficient function making an API call. It should accept necessary parameters where viable, and map them to the request parameters. Then the api folder should export an object containing all the endpoints in form of a single object, e.g.:

```
export const api = {
    chart: getChartData
}
```

where:

```
const getChartData = (gender: Gender, parameter: GrowthParameter) => <fetch logic>
```

Hooks should be defined in apps/mobile/api/hooks and should be built using tanstack query (package needs to be installed and wired into the app). For now we only have queries, but already we should introduce a folder separation between queries and mutations. Example of a query:

```
// apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.ts
export const useGetChartDataQuery = (gender: Gender, parameter: Parameter) => useQuery(...)
```

The query should reference the previously defined api endpoints as a fetcher.

<!-- SECTION:DESCRIPTION:END -->
