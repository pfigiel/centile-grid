---
id: TASK-7
title: Create TextInput and NumberInput components
status: Done
assignee: []
created_date: '2026-05-03 11:15'
updated_date: '2026-05-05 10:51'
labels:
  - ui-kit-mobile
dependencies: []
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create a TextInput component. Base it on RNP's component, similar to other existing components in ui-kit-mobile. TextInput should only expose basic props for now - label, value, onChangeText. All props should be optional. Create a basic unit tests suite for the component, following established patterns as seen in e.g. Select component.

Once TextInput is created, build a NumberInput component that would use the TextInput underneath. NumberInput should only accept numbers, and it should show a numeric keyboard when typing in the values. It should expose similar props to TextInput, other than value should be an optional number instead of optional string, and instead of onChangeText we should have onChangeValue.

<!-- SECTION:DESCRIPTION:END -->
