# TextInput and NumberInput Components — Design Spec

**Date:** 2026-05-03
**Task:** TASK-7

## Overview

Add `TextInput` and `NumberInput` to `packages/ui-kit-mobile`. Both live under `src/components/<Name>/` with a component file and a test file, following existing patterns (Button, Select).

## TextInput

A thin wrapper around RNP's `TextInput` component, consistent with how `Button` wraps RNP's `Button`.

**Props** (all optional):

- `label?: string`
- `value?: string`
- `onChangeText?: (text: string) => void`

No internal state. Props are passed straight through to RNP's TextInput.

## NumberInput

Wraps `TextInput`. Accepts a numeric value externally but manages an internal string for display, avoiding mid-edit display jumps (e.g. a trailing `"."` being stripped).

**Props** (all optional):

- `label?: string`
- `value?: number`
- `onChangeValue?: (value: number | undefined) => void`

**Internal behavior:**

- Internal `stringValue` state, initialized to `String(value ?? '')`
- `useEffect` watching `value` prop: if `parseFloat(stringValue) !== value` (accounting for `undefined`/`NaN`), update `stringValue` to `String(value ?? '')`. This allows programmatic updates (e.g. form resets) while not overriding mid-edit states like `"72."`
- `keyboardType="decimal-pad"` passed to TextInput
- `onChangeText`: updates `stringValue`, calls `onChangeValue(parseFloat(text))` for non-empty text, or `onChangeValue(undefined)` for empty

## Testing

Both components use `PaperProvider` wrapper in `renderComponent`, `describe/it` blocks, and `should <X> when <Y>` test naming.

**TextInput:**

- should render label when label prop provided
- should render value when value prop provided
- should call onChangeText when text changes

**NumberInput:**

- should render label when label prop provided
- should call onChangeValue with parsed number when text changes
- should call onChangeValue with undefined when text is cleared
- should not strip trailing decimal point when user is typing
- should update displayed value when value prop changes programmatically

## Exports

Both components exported from `packages/ui-kit-mobile/src/index.ts`.
