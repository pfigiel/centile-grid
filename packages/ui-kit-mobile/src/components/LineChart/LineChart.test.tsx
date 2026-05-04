import { render, screen } from '@testing-library/react-native';
import { LineChart } from './LineChart';

const lineSeries = [
  {
    data: [
      { x: 0, y: 49 },
      { x: 12, y: 75 },
    ],
    color: '#aaa',
    label: 'P3',
  },
  {
    data: [
      { x: 0, y: 50 },
      { x: 12, y: 77 },
    ],
    color: '#333',
    label: 'P50',
  },
];

const scatterSeries = {
  data: [{ x: 6, y: 65 }],
  color: '#e53935',
};

describe('LineChart', () => {
  it('should render without error when given only lineSeries', () => {
    render(<LineChart lineSeries={lineSeries} />);
  });

  it('should render without error when given lineSeries and scatterSeries', () => {
    render(<LineChart lineSeries={lineSeries} scatterSeries={scatterSeries} />);
  });

  it('should display xLabel when xLabel prop is provided', async () => {
    render(<LineChart lineSeries={lineSeries} xLabel="Age (months)" />);

    expect(await screen.findByText('Age (months)')).toBeOnTheScreen();
  });

  it('should not display xLabel when xLabel prop is not provided', () => {
    render(<LineChart lineSeries={lineSeries} />);

    expect(screen.queryByText('Age (months)')).toBeNull();
  });

  it('should display yLabel when yLabel prop is provided', async () => {
    render(<LineChart lineSeries={lineSeries} yLabel="Height (cm)" />);

    expect(await screen.findByText('Height (cm)')).toBeOnTheScreen();
  });

  it('should not display yLabel when yLabel prop is not provided', () => {
    render(<LineChart lineSeries={lineSeries} />);

    expect(screen.queryByText('Height (cm)')).toBeNull();
  });
});
