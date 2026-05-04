import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { CartesianChart, Line, Scatter, type PointsArray } from 'victory-native';

export type DataPoint = { x: number; y: number };

export type LineSeries = {
  data: DataPoint[];
  color?: string;
  label?: string;
};

export type ScatterSeries = {
  data: DataPoint[];
  color?: string;
};

export type Props = {
  lineSeries: LineSeries[];
  scatterSeries?: ScatterSeries;
  xLabel?: string;
  yLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_LINE_COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
const DEFAULT_SCATTER_COLOR = '#e53935';
const SCATTER_Y_KEY = 'scatter';

const buildChartData = (lineSeriesInput: LineSeries[], scatterSeries?: ScatterSeries) => {
  const lineYKeys = lineSeriesInput.map((_, i) => `line_${i}`);
  const yKeys: string[] = [...lineYKeys];

  const xValues = new Set<number>();
  lineSeriesInput.forEach((s) => s.data.forEach((p) => xValues.add(p.x)));
  if (scatterSeries) {
    scatterSeries.data.forEach((p) => xValues.add(p.x));
    yKeys.push(SCATTER_Y_KEY);
  }

  const lineLookups = lineSeriesInput.map((s) => new Map(s.data.map((p) => [p.x, p.y])));
  const scatterLookup = scatterSeries
    ? new Map(scatterSeries.data.map((p) => [p.x, p.y]))
    : new Map<number, number>();

  const data = Array.from(xValues)
    .sort((a, b) => a - b)
    .map((x) => {
      const row: Record<string, number | null> = { x };
      lineYKeys.forEach((key, i) => {
        row[key] = lineLookups[i].get(x) ?? null;
      });
      if (scatterSeries) {
        row[SCATTER_Y_KEY] = scatterLookup.get(x) ?? null;
      }
      return row;
    });

  return { data, lineYKeys, yKeys };
};

export const LineChart = ({ lineSeries, scatterSeries, xLabel, yLabel, style }: Props) => {
  const { data, lineYKeys, yKeys } = buildChartData(lineSeries, scatterSeries);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.chartRow}>
        {yLabel !== undefined && <Text style={styles.yLabel}>{yLabel}</Text>}
        <View style={styles.chartArea}>
          <CartesianChart data={data as any} xKey={'x' as never} yKeys={yKeys as any}>
            {({ points }: { points: Record<string, PointsArray> }) => (
              <>
                {lineYKeys.map((key, i) => (
                  <Line
                    key={key}
                    points={points[key]}
                    color={
                      lineSeries[i].color ?? DEFAULT_LINE_COLORS[i % DEFAULT_LINE_COLORS.length]
                    }
                    strokeWidth={1.5}
                  />
                ))}
                {scatterSeries !== undefined && (
                  <Scatter
                    points={points[SCATTER_Y_KEY]}
                    color={scatterSeries.color ?? DEFAULT_SCATTER_COLOR}
                    radius={4}
                  />
                )}
              </>
            )}
          </CartesianChart>
        </View>
      </View>
      {xLabel !== undefined && <Text style={styles.xLabel}>{xLabel}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartRow: {
    flex: 1,
    flexDirection: 'row',
  },
  chartArea: {
    flex: 1,
  },
  yLabel: {
    transform: [{ rotate: '-90deg' }],
    alignSelf: 'center',
  },
  xLabel: {
    textAlign: 'center',
    marginTop: 4,
  },
});
