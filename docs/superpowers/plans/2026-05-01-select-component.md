# Select Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `BottomSheet` and `Select` components to `@centile-grid/ui-kit-mobile`, both publicly exported and fully tested.

**Architecture:** `BottomSheet` wraps gorhom's `BottomSheetModal` (portal-based, avoids z-index issues) with a controlled `isOpen`/`onClose` API. `Select` composes `BottomSheet` with an outlined toggle whose label animates between placeholder and floating positions via `react-native-reanimated`. Item list uses `BottomSheetScrollView` so it scrolls when options overflow the sheet.

**Tech Stack:** `@gorhom/bottom-sheet` ^5.2.13, `react-native-reanimated` (already in workspace at 4.1.1), `@testing-library/react-native`, `jest-expo`.

---

## File Map

| Action | Path                                                                     | Responsibility                              |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------- |
| Create | `packages/ui-kit-mobile/src/components/BottomSheet/BottomSheet.tsx`      | BottomSheetModal wrapper                    |
| Create | `packages/ui-kit-mobile/src/components/BottomSheet/BottomSheet.test.tsx` | BottomSheet tests                           |
| Create | `packages/ui-kit-mobile/src/components/BottomSheet/index.ts`             | Re-export                                   |
| Create | `packages/ui-kit-mobile/src/components/Select/Select.tsx`                | Select component                            |
| Create | `packages/ui-kit-mobile/src/components/Select/Select.test.tsx`           | Select tests                                |
| Create | `packages/ui-kit-mobile/src/components/Select/index.ts`                  | Re-export                                   |
| Modify | `packages/ui-kit-mobile/package.json`                                    | Add `@gorhom/bottom-sheet` dependency       |
| Modify | `packages/ui-kit-mobile/jest.config.mjs`                                 | Add reanimated mock + gorhom transform      |
| Modify | `packages/ui-kit-mobile/src/index.ts`                                    | Export BottomSheet and Select               |
| Modify | `apps/mobile/app/_layout.tsx`                                            | Wrap app root with BottomSheetModalProvider |

---

## Task 1: Add @gorhom/bottom-sheet dependency

**Files:**

- Modify: `packages/ui-kit-mobile/package.json`

- [ ] **Step 1: Add dependency to package.json**

Edit `packages/ui-kit-mobile/package.json` to add a `dependencies` block:

```json
{
  "name": "@centile-grid/ui-kit-mobile",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "jest --passWithNoTests"
  },
  "dependencies": {
    "@gorhom/bottom-sheet": "^5.2.13"
  },
  "peerDependencies": {
    "react": ">=19.0.0",
    "react-native": ">=0.81.0",
    "react-native-paper": ">=5.0.0"
  },
  "devDependencies": {
    "@centile-grid/eslint-plugin": "workspace:*",
    "eslint": "catalog:lint",
    "eslint-config-prettier": "catalog:lint",
    "@testing-library/react-native": "catalog:test",
    "@types/jest": "catalog:test",
    "jest": "catalog:test",
    "jest-expo": "catalog:test",
    "react-test-renderer": "catalog:react"
  }
}
```

- [ ] **Step 2: Install**

Run from the repo root:

```bash
pnpm install
```

Expected: `@gorhom/bottom-sheet` appears in `node_modules/@gorhom/bottom-sheet`.

- [ ] **Step 3: Commit**

```bash
git add packages/ui-kit-mobile/package.json pnpm-lock.yaml
git commit -m "chore(ui-kit-mobile): add @gorhom/bottom-sheet dependency"
```

---

## Task 2: Configure jest for react-native-reanimated

`react-native-reanimated` ships TypeScript source that Jest must transform. We also map it to the provided mock so animations are no-ops in unit tests. `@gorhom/bottom-sheet` similarly needs transformation.

**Files:**

- Modify: `packages/ui-kit-mobile/jest.config.mjs`

- [ ] **Step 1: Update jest.config.mjs**

```js
// packages/ui-kit-mobile/jest.config.mjs
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-reanimated|@gorhom)/)',
  ],
  moduleNameMapper: {
    '^react-native-reanimated$': require.resolve('react-native-reanimated/mock'),
  },
};
```

- [ ] **Step 2: Verify existing tests still pass**

```bash
cd packages/ui-kit-mobile && pnpm test
```

Expected output includes:

```
PASS src/components/Button/Button.test.tsx
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui-kit-mobile/jest.config.mjs
git commit -m "chore(ui-kit-mobile): configure jest for reanimated mock"
```

---

## Task 3: BottomSheet component

**Files:**

- Create: `packages/ui-kit-mobile/src/components/BottomSheet/BottomSheet.test.tsx`
- Create: `packages/ui-kit-mobile/src/components/BottomSheet/BottomSheet.tsx`
- Create: `packages/ui-kit-mobile/src/components/BottomSheet/index.ts`
- Modify: `packages/ui-kit-mobile/src/index.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/ui-kit-mobile/src/components/BottomSheet/BottomSheet.test.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { BottomSheet } from './BottomSheet';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { Pressable } = require('react-native');
  return {
    BottomSheetModal: React.forwardRef(
      (
        { children, onDismiss }: { children: React.ReactNode; onDismiss?: () => void },
        ref: React.Ref<unknown>,
      ) => {
        const [visible, setVisible] = React.useState(false);
        React.useImperativeHandle(ref, () => ({
          present: () => setVisible(true),
          dismiss: () => setVisible(false),
        }));
        if (!visible) return null;
        return (
          <>
            {children}
            <Pressable testID="dismiss-trigger" onPress={onDismiss} />
          </>
        );
      },
    ),
  };
});

describe('BottomSheet', () => {
  it('should render children when isOpen is true', () => {
    const { getByText } = render(
      <BottomSheet isOpen={true} onClose={jest.fn()}>
        <Text>Content</Text>
      </BottomSheet>,
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('should not render children when isOpen is false', () => {
    const { queryByText } = render(
      <BottomSheet isOpen={false} onClose={jest.fn()}>
        <Text>Content</Text>
      </BottomSheet>,
    );
    expect(queryByText('Content')).toBeNull();
  });

  it('should call onClose when dismissed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <Text>Content</Text>
      </BottomSheet>,
    );
    fireEvent.press(getByTestId('dismiss-trigger'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/ui-kit-mobile && pnpm test src/components/BottomSheet/BottomSheet.test.tsx
```

Expected: `FAIL` — `Cannot find module './BottomSheet'`

- [ ] **Step 3: Implement BottomSheet.tsx**

Create `packages/ui-kit-mobile/src/components/BottomSheet/BottomSheet.tsx`:

```tsx
import { ReactNode, useEffect, useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const BottomSheet = ({ isOpen, onClose, children }: Props) => {
  const ref = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [isOpen]);

  return (
    <BottomSheetModal ref={ref} snapPoints={['50%']} onDismiss={onClose}>
      {children}
    </BottomSheetModal>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd packages/ui-kit-mobile && pnpm test src/components/BottomSheet/BottomSheet.test.tsx
```

Expected:

```
PASS src/components/BottomSheet/BottomSheet.test.tsx
  BottomSheet
    ✓ should render children when isOpen is true
    ✓ should not render children when isOpen is false
    ✓ should call onClose when dismissed
```

- [ ] **Step 5: Create index.ts**

Create `packages/ui-kit-mobile/src/components/BottomSheet/index.ts`:

```ts
export { BottomSheet } from './BottomSheet';
```

- [ ] **Step 6: Export from src/index.ts**

Edit `packages/ui-kit-mobile/src/index.ts`:

```ts
export { Button } from './components/Button';
export { BottomSheet } from './components/BottomSheet';
```

- [ ] **Step 7: Typecheck**

```bash
cd packages/ui-kit-mobile && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add packages/ui-kit-mobile/src/components/BottomSheet/ packages/ui-kit-mobile/src/index.ts
git commit -m "feat(ui-kit-mobile): add BottomSheet component"
```

---

## Task 4: Select component

**Files:**

- Create: `packages/ui-kit-mobile/src/components/Select/Select.test.tsx`
- Create: `packages/ui-kit-mobile/src/components/Select/Select.tsx`
- Create: `packages/ui-kit-mobile/src/components/Select/index.ts`
- Modify: `packages/ui-kit-mobile/src/index.ts`

The `@gorhom/bottom-sheet` mock here must export both `BottomSheetModal` (used by `BottomSheet`) and `BottomSheetScrollView` (used directly by `Select`). `react-native-reanimated` is mocked automatically via `jest.config.mjs`.

- [ ] **Step 1: Write the failing tests**

Create `packages/ui-kit-mobile/src/components/Select/Select.test.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Select } from './Select';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { Pressable, ScrollView } = require('react-native');
  return {
    BottomSheetModal: React.forwardRef(
      (
        { children, onDismiss }: { children: React.ReactNode; onDismiss?: () => void },
        ref: React.Ref<unknown>,
      ) => {
        const [visible, setVisible] = React.useState(false);
        React.useImperativeHandle(ref, () => ({
          present: () => setVisible(true),
          dismiss: () => setVisible(false),
        }));
        if (!visible) return null;
        return (
          <>
            {children}
            <Pressable testID="dismiss-trigger" onPress={onDismiss} />
          </>
        );
      },
    ),
    BottomSheetScrollView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(ScrollView, null, children),
  };
});

describe('Select', () => {
  const options = ['Male', 'Female', 'Other'] as const;

  it('should render label', () => {
    const { getByText } = render(<Select options={[...options]} label="Sex" />);
    expect(getByText('Sex')).toBeTruthy();
  });

  it('should render selected value in toggle', () => {
    const { getAllByText } = render(<Select options={[...options]} value="Male" />);
    expect(getAllByText('Male').length).toBeGreaterThan(0);
  });

  it('should render raw string value when renderValue is not provided', () => {
    const { getAllByText } = render(<Select options={[...options]} value="Female" />);
    expect(getAllByText('Female').length).toBeGreaterThan(0);
  });

  it('should use renderValue to render toggle value when provided', () => {
    const { getByText } = render(
      <Select options={[...options]} value="Male" renderValue={(v) => <Text>{`(${v})`}</Text>} />,
    );
    expect(getByText('(Male)')).toBeTruthy();
  });

  it('should open bottom sheet when toggle is pressed', () => {
    const { getByRole, getByText } = render(<Select options={[...options]} label="Sex" />);
    fireEvent.press(getByRole('combobox'));
    expect(getByText('Female')).toBeTruthy();
  });

  it('should render all options in the list', () => {
    const { getByRole, getAllByRole } = render(<Select options={[...options]} />);
    fireEvent.press(getByRole('combobox'));
    expect(getAllByRole('option')).toHaveLength(3);
  });

  it('should use renderValue to render options when provided', () => {
    const { getByRole, getByText } = render(
      <Select options={[...options]} renderValue={(v) => <Text>{`[${v}]`}</Text>} />,
    );
    fireEvent.press(getByRole('combobox'));
    expect(getByText('[Male]')).toBeTruthy();
    expect(getByText('[Female]')).toBeTruthy();
    expect(getByText('[Other]')).toBeTruthy();
  });

  it('should call onSelect when item is pressed', () => {
    const onSelect = jest.fn();
    const { getByRole, getByText } = render(<Select options={[...options]} onSelect={onSelect} />);
    fireEvent.press(getByRole('combobox'));
    fireEvent.press(getByText('Female'));
    expect(onSelect).toHaveBeenCalledWith('Female');
  });

  it('should close bottom sheet when item is selected', () => {
    const { getByRole, getByText, queryByText } = render(<Select options={[...options]} />);
    fireEvent.press(getByRole('combobox'));
    expect(getByText('Other')).toBeTruthy();
    fireEvent.press(getByText('Female'));
    expect(queryByText('Other')).toBeNull();
  });

  it('should mark currently selected item with checkmark', () => {
    const { getByRole, getByText } = render(<Select options={[...options]} value="Male" />);
    fireEvent.press(getByRole('combobox'));
    expect(getByText('✓')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/ui-kit-mobile && pnpm test src/components/Select/Select.test.tsx
```

Expected: `FAIL` — `Cannot find module './Select'`

- [ ] **Step 3: Implement Select.tsx**

Create `packages/ui-kit-mobile/src/components/Select/Select.tsx`:

```tsx
import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BottomSheet } from '../BottomSheet';

type Props<T extends string> = {
  value?: T;
  options: T[];
  label?: string;
  renderValue?: (value: T) => ReactNode;
  onSelect?: (value: T) => void;
};

const LABEL_TOP_EMPTY = 16;
const LABEL_TOP_FILLED = -10;
const LABEL_SIZE_EMPTY = 16;
const LABEL_SIZE_FILLED = 12;

export const Select = <T extends string>({
  value,
  options,
  label,
  renderValue,
  onSelect,
}: Props<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const progress = useSharedValue(value !== undefined ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value !== undefined ? 1 : 0, { duration: 150 });
  }, [value, progress]);

  const animatedLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [LABEL_TOP_EMPTY, LABEL_TOP_FILLED]),
    fontSize: interpolate(progress.value, [0, 1], [LABEL_SIZE_EMPTY, LABEL_SIZE_FILLED]),
  }));

  const handleSelect = (item: T) => {
    onSelect?.(item);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Pressable role="combobox" style={styles.toggle} onPress={() => setIsOpen(true)}>
        {label && <Animated.Text style={[styles.label, animatedLabelStyle]}>{label}</Animated.Text>}
        {value !== undefined && (
          <Text style={styles.value}>{renderValue ? renderValue(value) : value}</Text>
        )}
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <BottomSheetScrollView>
          {label && <Text style={styles.sheetHeader}>{label}</Text>}
          {options.map((option) => (
            <Pressable
              key={option}
              role="option"
              style={styles.item}
              onPress={() => handleSelect(option)}
            >
              <Text>{renderValue ? renderValue(option) : option}</Text>
              {value === option && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          ))}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  toggle: {
    borderWidth: 2,
    borderColor: '#86868b',
    borderRadius: 6,
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingRight: 44,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 10,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    color: '#86868b',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  chevron: {
    position: 'absolute',
    right: 12,
    top: 16,
    color: '#86868b',
    fontSize: 12,
  },
  sheetHeader: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: '#86868b',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  checkmark: {
    color: '#0a84ff',
    fontSize: 14,
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd packages/ui-kit-mobile && pnpm test src/components/Select/Select.test.tsx
```

Expected:

```
PASS src/components/Select/Select.test.tsx
  Select
    ✓ should render label
    ✓ should render selected value in toggle
    ✓ should render raw string value when renderValue is not provided
    ✓ should use renderValue to render toggle value when provided
    ✓ should open bottom sheet when toggle is pressed
    ✓ should render all options in the list
    ✓ should use renderValue to render options when provided
    ✓ should call onSelect when item is pressed
    ✓ should close bottom sheet when item is selected
    ✓ should mark currently selected item with checkmark
```

- [ ] **Step 5: Create index.ts**

Create `packages/ui-kit-mobile/src/components/Select/index.ts`:

```ts
export { Select } from './Select';
```

- [ ] **Step 6: Export from src/index.ts**

Edit `packages/ui-kit-mobile/src/index.ts`:

```ts
export { Button } from './components/Button';
export { BottomSheet } from './components/BottomSheet';
export { Select } from './components/Select';
```

- [ ] **Step 7: Run full test suite**

```bash
cd packages/ui-kit-mobile && pnpm test
```

Expected: all test files pass.

- [ ] **Step 8: Typecheck**

```bash
cd packages/ui-kit-mobile && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add packages/ui-kit-mobile/src/components/Select/ packages/ui-kit-mobile/src/index.ts
git commit -m "feat(ui-kit-mobile): add Select component"
```

---

## Task 5: Wire BottomSheetModalProvider in the app root

`BottomSheetModal` renders via a portal; `BottomSheetModalProvider` must exist above it in the tree or the sheet will silently fail to appear.

**Files:**

- Modify: `apps/mobile/app/_layout.tsx`

- [ ] **Step 1: Wrap the root layout**

Current content of `apps/mobile/app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

const RootLayout = () => <Stack screenOptions={{ headerShown: false }} />;

export default RootLayout;
```

Replace with:

```tsx
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const RootLayout = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <BottomSheetModalProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </BottomSheetModalProvider>
  </GestureHandlerRootView>
);

export default RootLayout;
```

Note: `GestureHandlerRootView` is required by `react-native-gesture-handler` (already installed in the app). Both `@gorhom/bottom-sheet` and `react-native-gesture-handler` are resolvable from `apps/mobile` — the former transitively via `ui-kit-mobile`, the latter as a direct dependency.

- [ ] **Step 2: Typecheck the app**

```bash
cd apps/mobile && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/_layout.tsx
git commit -m "feat(mobile): wire BottomSheetModalProvider and GestureHandlerRootView at app root"
```
