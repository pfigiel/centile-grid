---
id: TASK-13
title: Display centile grid
status: In Progress
assignee: []
created_date: '2026-05-07 17:14'
updated_date: '2026-05-07 17:14'
labels: []
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Integrate existing mobile app with backend app to create first version of full centile grid functionality.

Create a new screen in the app on which the charts will be presented. User should be automatically navigated to that screen once the form on the main page gets submitted. On the page there should be one chart per each metric the user selected on the form (so max 2 charts for now - for height and weight). The screen should include a back button at the top allowing to go back to the form screen.

Use the existing useGetChartDataQuery hook for fetching chart data and LineChart component for rendering the charts. Remember to add the scatter series on the chart representing the parameter value entered by the user on the form.

Decide on the best flow for transitioning between the screens during planning - whether fetching charts should happen on form or results screen and how to share the necessary data between the screens. Follow best practices during planning.

<!-- SECTION:DESCRIPTION:END -->
