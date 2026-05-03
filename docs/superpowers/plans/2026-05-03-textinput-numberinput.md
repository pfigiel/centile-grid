# TextInput and NumberInput Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `TextInput` and `NumberInput` components to `packages/ui-kit-mobile`, each with unit tests and exported from the package index.

**Architecture:** `TextInput` is a thin stateless wrapper around RNP's `TextInput`. `NumberInput` wraps our `TextInput`, holding internal string state for display while exposing a numeric value externally — syncing from the `value` prop only when the parsed internal value differs, to avoid mid-edit display jumps (e.g. a trailing `"."` being stripped).

**Tech Stack:** React Native, react-native-paper (RNP), @testing-library/react-native, Jest

---

## File Map

| Action | Path                                                                     | Responsibility                 |
| ------ | ------------------------------------------------------------------------ | ------------------------------ |
| Create | `packages/ui-kit-mobile/src/components/TextInput/TextInput.tsx`          | Thin RNP wrapper               |
| Create | `packages/ui-kit-mobile/src/components/TextInput/TextInput.test.tsx`     | Unit tests for TextInput       |
| Create | `packages/ui-kit-mobile/src/components/NumberInput/NumberInput.tsx`      | Numeric wrapper over TextInput |
| Create | `packages/ui-kit-mobile/src/components/NumberInput/NumberInput.test.tsx` | Unit tests for NumberInput     |
| Modify | `packages/ui-kit-mobile/src/index.ts`                                    | Export both components         |

---

### Task 1: TextInput component

**Files:**

- Create: `packages/ui-kit-mobile/src/components/TextInput/TextInput.tsx`
- Create: `packages/ui-kit-mobile/src/components/TextInput/TextInput.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `packages/ui-kit-mobile/src/components/TextInput/TextInput.test.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  const renderComponent = (props: React.ComponentProps<typeof TextInput> = {}) =>
    render(
      <PaperProvider>
        <TextInput {...props} />
      </PaperProvider>,
    );

  it('should render label when label prop provided', () => {
    const { getByText } = renderComponent({ label: 'Name' });
    expect(getByText('Name')).toBeTruthy();
  });

  it('should render value when value prop provided', () => {
    const { getByDisplayValue } = renderComponent({ value: 'John' });
    expect(getByDisplayValue('John')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = renderComponent({ value: 'initial', onChangeText });
    fireEvent.changeText(getByDisplayValue('initial'), 'updated');
    expect(onChangeText).toHaveBeenCalledWith('updated');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @centile-grid/ui-kit-mobile test src/components/TextInput/TextInput.test.tsx
```

Expected: FAIL — `Cannot find module './TextInput'`

- [ ] **Step 3: Implement TextInput**

Create `packages/ui-kit-mobile/src/components/TextInput/TextInput.tsx`:

```tsx
import { TextInput as RNPTextInput } from 'react-native-paper';

type Props = {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
};

export const TextInput = ({ label, value, onChangeText, keyboardType }: Props) => (
  <RNPTextInput
    label={label}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType}
  />
);
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @centile-grid/ui-kit-mobile test src/components/TextInput/TextInput.test.tsx
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add packages/ui-kit-mobile/src/components/TextInput/
git commit -m "feat(ui-kit-mobile): add TextInput component"
```

---

### Task 2: NumberInput component

**Files:**

- Create: `packages/ui-kit-mobile/src/components/NumberInput/NumberInput.tsx`
- Create: `packages/ui-kit-mobile/src/components/NumberInput/NumberInput.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `packages/ui-kit-mobile/src/components/NumberInput/NumberInput.test.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { NumberInput } from './NumberInput';

describe('NumberInput', () => {
  const renderComponent = (props: React.ComponentProps<typeof NumberInput> = {}) =>
    render(
      <PaperProvider>
        <NumberInput {...props} />
      </PaperProvider>,
    );

  it('should render label when label prop provided', () => {
    const { getByText } = renderComponent({ label: 'Weight' });
    expect(getByText('Weight')).toBeTruthy();
  });

  it('should call onChangeValue with parsed number when text changes', () => {
    const onChangeValue = jest.fn();
    const { getByDisplayValue } = renderComponent({ value: 0, onChangeValue });
    fireEvent.changeText(getByDisplayValue('0'), '72');
    expect(onChangeValue).toHaveBeenCalledWith(72);
  });

  it('should call onChangeValue with undefined when text is cleared', () => {
    const onChangeValue = jest.fn();
    const { getByDisplayValue } = renderComponent({ value: 72, onChangeValue });
    fireEvent.changeText(getByDisplayValue('72'), '');
    expect(onChangeValue).toHaveBeenCalledWith(undefined);
  });

  it('should not strip trailing decimal point when user is typing', () => {
    const onChangeValue = jest.fn();
    const { getByDisplayValue } = renderComponent({ value: 72, onChangeValue });
    fireEvent.changeText(getByDisplayValue('72'), '72.');
    expect(getByDisplayValue('72.')).toBeTruthy();
    expect(onChangeValue).toHaveBeenCalledWith(72);
  });

  it('should update displayed value when value prop changes programmatically', () => {
    const { getByDisplayValue, rerender } = renderComponent({ value: 72 });
    rerender(
      <PaperProvider>
        <NumberInput value={80} />
      </PaperProvider>,
    );
    expect(getByDisplayValue('80')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @centile-grid/ui-kit-mobile test src/components/NumberInput/NumberInput.test.tsx
```

Expected: FAIL — `Cannot find module './NumberInput'`

- [ ] **Step 3: Implement NumberInput**

Create `packages/ui-kit-mobile/src/components/NumberInput/NumberInput.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { TextInput } from '../TextInput';

type Props = {
  label?: string;
  value?: number;
  onChangeValue?: (value: number | undefined) => void;
};

export const NumberInput = ({ label, value, onChangeValue }: Props) => {
  const [stringValue, setStringValue] = useState(String(value ?? ''));

  useEffect(() => {
    setStringValue((prev) => {
      if (value === undefined) return prev === '' ? prev : '';
      const parsed = parseFloat(prev);
      if (!Number.isNaN(parsed) && parsed === value) return prev;
      return String(value);
    });
  }, [value]);

  const handleChangeText = (text: string) => {
    setStringValue(text);
    if (text === '') {
      onChangeValue?.(undefined);
    } else {
      const parsed = parseFloat(text);
      if (!Number.isNaN(parsed)) {
        onChangeValue?.(parsed);
      }
    }
  };

  return (
    <TextInput
      label={label}
      value={stringValue}
      onChangeText={handleChangeText}
      keyboardType="decimal-pad"
    />
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @centile-grid/ui-kit-mobile test src/components/NumberInput/NumberInput.test.tsx
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add packages/ui-kit-mobile/src/components/NumberInput/
git commit -m "feat(ui-kit-mobile): add NumberInput component"
```

---

### Task 3: Export both components from package index

**Files:**

- Modify: `packages/ui-kit-mobile/src/index.ts`

- [ ] **Step 1: Add exports**

Edit `packages/ui-kit-mobile/src/index.ts` to add two new export lines after the existing ones:

```ts
export { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
export { BottomSheetModal } from './components/BottomSheetModal';
export { Button } from './components/Button';
export { NumberInput } from './components/NumberInput';
export { Select } from './components/Select';
export { TextInput } from './components/TextInput';
```

- [ ] **Step 2: Run the full package test suite**

```bash
pnpm --filter @centile-grid/ui-kit-mobile test
```

Expected: PASS — all tests passing

- [ ] **Step 3: Run typecheck**

```bash
pnpm --filter @centile-grid/ui-kit-mobile typecheck
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add packages/ui-kit-mobile/src/index.ts
git commit -m "feat(ui-kit-mobile): export TextInput and NumberInput"
```
