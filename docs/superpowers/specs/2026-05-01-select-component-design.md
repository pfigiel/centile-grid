# Select Component Design

**Date:** 2026-05-01
**Package:** `@centile-grid/ui-kit-mobile`

## Overview

Two new public components added to `ui-kit-mobile`: a generic `BottomSheet` and a controlled `Select`. `Select` uses `BottomSheet` internally to present a scrollable list of options.

## Components

### BottomSheet

A generic, publicly exported wrapper around `@gorhom/bottom-sheet`'s `BottomSheetModal`. Renders its content in a portal above everything else, avoiding z-index and clipping issues.

**Props:**

```ts
type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};
```

- When `isOpen` transitions to `true`, calls `ref.present()` on the internal `BottomSheetModal`.
- When `isOpen` transitions to `false`, calls `ref.dismiss()`.
- Swipe-down gesture dismissal triggers `onClose`.

**Consumer requirement:** The app root must wrap the component tree with `<BottomSheetModalProvider>` from `@gorhom/bottom-sheet`.

### Select\<T extends string\>

A controlled select input. Consists of an outlined toggle that shows the current value, and a `BottomSheet` containing a scrollable list of options.

**Props:**

```ts
type Props<T extends string> = {
  value?: T;
  options: T[];
  label?: string;
  renderValue?: (value: T) => ReactNode;
  onSelect?: (value: T) => void;
};
```

- `renderValue` is used in both the toggle display and each item in the option list. Falls back to rendering the raw string if not provided.
- Selecting an item calls `onSelect(value)` then closes the sheet.
- Only controlled — no internal value state.

## Visual Design

### Toggle (outlined, RNP TextInput style)

- **No value selected:** Outlined box with `label` rendered as placeholder text inside. Chevron (▼) on the right.
- **Value selected:** Label floats above the top border (positioned via absolute layout over the border). Value text rendered inside using `renderValue` or raw string. Chevron on the right.
- **No label prop:** No floating label; value displayed inside the box without a floating element.
- Label position is purely conditional on whether `value` is set — no animation.

### Bottom sheet item list

- Small header at the top of the sheet showing `label` (if provided).
- Each option rendered as a `Pressable` row using `renderValue` or raw string.
- Currently selected item shows a checkmark (✓) on the right.
- Item list wrapped in `BottomSheetScrollView` (gorhom's scroll-aware wrapper) so it scrolls when options overflow the sheet.

## Dependencies

`@gorhom/bottom-sheet` added as a direct dependency in `packages/ui-kit-mobile/package.json`. The mobile app already provides the required peers (`react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`) — `apps/mobile/package.json` is not modified.

## File Structure

```
packages/ui-kit-mobile/src/components/
  BottomSheet/
    BottomSheet.tsx
    BottomSheet.test.tsx
    index.ts
  Select/
    Select.tsx
    Select.test.tsx
    index.ts
```

Both exported from `src/index.ts`.

## Testing

All test names follow the `should <X> when <Y>` convention. "When" clause may be omitted for trivial cases.

**BottomSheet.test.tsx:**

- should render children when isOpen is true
- should not render children when isOpen is false
- should call onClose when dismissed

**Select.test.tsx:**

- should render label
- should render selected value in toggle
- should render raw string value when renderValue is not provided
- should use renderValue to render toggle value when provided
- should open bottom sheet when toggle is pressed
- should render all options in the list
- should use renderValue to render options when provided
- should call onSelect when item is pressed
- should close bottom sheet when item is selected
- should mark currently selected item with checkmark

## Conventions

- Component prop types named `Props` (not `SelectProps`, `BottomSheetProps`, etc.)
- Test names: `should <X> when <Y>`
