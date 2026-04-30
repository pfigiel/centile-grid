---
id: TASK-4
title: Add ui-kit-mobile package
status: In Progress
assignee: []
created_date: '2026-04-30 17:11'
updated_date: '2026-04-30 17:11'
labels: []
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create a package named ui-kit-mobile in the monorepo. The package should expose different domain-agnostic UI components for mobile app, like button, text input etc.

Use React Native Paper package as the base for the package. In the package we will be declaring components that will wrap the underlying RNP components. These wrappers will define their own Props type, which will restrict and map (if needed) props to the library component's props. Each component will also be later tested, but this is outside the scope of the story.

This story is about the package setup. In this first version just introduce a Button component to the package. For now Button should only accept a single "children" prop.

<!-- SECTION:DESCRIPTION:END -->
