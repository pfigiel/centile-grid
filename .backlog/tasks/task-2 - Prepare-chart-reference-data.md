---
id: TASK-2
title: Prepare chart reference data
status: To Do
assignee: []
created_date: '2026-04-30 09:58'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Prepare tabular data for the centile grid charts. Use the data for Polish population, from OLAF and OLA projects.

Based on previously conducted research, the raw tabular data is not publicly available. Instead, take screenshots of charts from the available studies and run them through AI to reverse-engineer the data.

There should be separate CSV file for each chart. Each chart will consist of a metric (height, weight etc.) and age (0 to 18). Datasets should be separate for boys and girls. So the columns of CSVs should be:

- age
- c3
- c10
- c25
- c50
- c75
- c90
- c97

where "c\*" is the centile value for given age.

<!-- SECTION:DESCRIPTION:END -->
