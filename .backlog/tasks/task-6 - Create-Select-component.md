---
id: TASK-6
title: Create Select component
status: Done
assignee: []
created_date: '2026-05-01 10:57'
updated_date: '2026-05-03 17:56'
labels:
  - ui-kit-mobile
dependencies: []
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create a Select component in ui-kit-mobile package. The component should consist of a toggle displaying currently selected value, and an items list in form of a bottom sheet. The toggle should support a floating label, similar in style to the RNP's TextInput.

The component's value should be a generic type extending string. The component should accept the props:

- value (optional T)
- options (T array)
- label (optional string)
- renderValue (optional callback accepting T as argument and returning ReactNode being formatted value - if defined used both to render value and options)
- onSelect (optional callback with value as argument)

When toggle gets clicked, there should be a bottom sheet shown with available select items dispayed. Clicking the item should close the sheet and update the value of the Select.

The bottom sheet should be a separate component in the ui-kit. Consider using an external library for it, recommended by RNP: osdnk/reanimated-bottom-sheet or gorhom/react-native-bottom-sheet (decide during planning). The bottom sheet component itself should be generic.

Due to the nature of Select component, it should only be controlled for now, uncontrolled version is OOS for now.

<!-- SECTION:DESCRIPTION:END -->
