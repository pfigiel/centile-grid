---
id: TASK-11
title: Add chart endpoints
status: In Progress
assignee: []
created_date: '2026-05-05 10:51'
updated_date: '2026-05-05 10:52'
labels: []
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Extend the backend app by adding endpoints for fetching chart data.

The shape of the endpoints should look like this:
GET /chart/<gender>/<parameter>
where <gender> can be male or female and parameter can be height or weight (more parameters will be added in the future)

The endpoint should return a resonse in JSON shape:

```
{
    "data": [
        {
            "age": 3,
            "c3": 91,
            "c10": 93,
            "c25": 95.5,
            "c50": 98,
            "c75": 100.5,
            "c90": 103,
            "c97": 105
        },
        {
            "age": 4,
            ...
        }
    ]
}
```

Data that should be returned from the endpoints currently lives in form of CSV files in backend/src. The data should remain in CSV form for now, but files can be moved around do achieve clean project structure.

Ensure to prepare the endpoints so that data in CSV form works on serverless deployment.

<!-- SECTION:DESCRIPTION:END -->
