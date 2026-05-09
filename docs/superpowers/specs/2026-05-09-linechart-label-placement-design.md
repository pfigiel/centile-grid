# LineChart Label Placement & Container Design

**Date:** 2026-05-09
**Status:** Approved

## Problem

`LineChart` renders `xLabel` and `yLabel` as React Native `<Text>` elements outside the Skia canvas. This adds visual padding to the chart's bounding box — the chart never fills its container edge-to-edge.

## Design

### 1. Axis labels inside the canvas

Move `xLabel` and `yLabel` rendering into the Skia canvas as corner overlays:

- **Y label** — top-left of the plot area
- **X label** — bottom-right of the plot area

Both rendered with `matchFont` (same as axis tick font) via Skia `Text` primitives inside the `CartesianChart` render function. The external `<Text>` elements and their wrapping `<View>` layout are removed entirely.

Label pixel positions are derived from the `chartBounds` object provided by victory-native's `CartesianChart` render prop (`{ chartBounds: { left, right, top, bottom } }`). Y label anchors to `(chartBounds.left + padding, chartBounds.top + lineHeight)`; X label anchors to `(chartBounds.right - textWidth - padding, chartBounds.bottom - padding)`.

Props `xLabel` and `yLabel` on `LineChart` remain unchanged (`string | undefined`).

### 2. `LineChart.Container` static member

A dedicated `Container` component lives at:

```
packages/ui-kit-mobile/src/components/LineChart/Container.tsx
```

It is attached as a static member:

```ts
LineChart.Container = Container;
```

**Props:**

```ts
type ContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};
```

**Visual behaviour:**

- Drop shadow — platform-aware: `elevation` on Android, `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius` on iOS
- No hardcoded background color — inherits from caller/theme
- Rounded corners (`borderRadius: 8`), padding (`padding: 12`)

**Usage:**

```tsx
<LineChart.Container>
  <LineChart lineSeries={...} xLabel="Age (months)" yLabel="Height (cm)" />
</LineChart.Container>
```

### 3. No other changes

- No new props on `LineChart`
- No changes to `Props` type surface
- No changes to `index.ts` exports beyond re-exporting `Container` if needed

## Files affected

| File                                                                 | Change                                                                                                           |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `packages/ui-kit-mobile/src/components/LineChart/LineChart.tsx`      | Remove external label `<Text>` + wrapping layout; render labels inside Skia canvas; attach `LineChart.Container` |
| `packages/ui-kit-mobile/src/components/LineChart/Container.tsx`      | New file — shadow card wrapper component                                                                         |
| `packages/ui-kit-mobile/src/components/LineChart/LineChart.test.tsx` | Update tests for new label rendering                                                                             |
