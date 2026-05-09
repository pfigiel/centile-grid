import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ComponentProps } from 'react';
import { LineChart } from './LineChart';
import { Container } from './Container';

type Props = ComponentProps<typeof LineChart>;

const lineSeries: Props['lineSeries'] = [
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

const scatterSeries: Props['scatterSeries'] = {
  data: [{ x: 6, y: 65 }],
  color: '#e53935',
};

const renderComponent = (props: Partial<Props> = {}) =>
  render(<LineChart lineSeries={lineSeries} {...props} />);

describe('LineChart', () => {
  it('should render without error when given only lineSeries', async () => {
    renderComponent({ xLabel: 'Age' });

    expect(await screen.findByText('Age')).toBeOnTheScreen();
  });

  it('should render without error when given lineSeries and scatterSeries', async () => {
    renderComponent({ scatterSeries, xLabel: 'Age' });

    expect(await screen.findByText('Age')).toBeOnTheScreen();
  });

  it('should display xLabel when xLabel prop is provided', async () => {
    renderComponent({ xLabel: 'Age (months)' });

    expect(await screen.findByText('Age (months)')).toBeOnTheScreen();
  });

  it('should not display xLabel when xLabel prop is not provided', () => {
    renderComponent();

    expect(screen.queryByText('Age (months)')).not.toBeOnTheScreen();
  });

  it('should display yLabel when yLabel prop is provided', async () => {
    renderComponent({ yLabel: 'Height (cm)' });

    expect(await screen.findByText('Height (cm)')).toBeOnTheScreen();
  });

  it('should not display yLabel when yLabel prop is not provided', () => {
    renderComponent();

    expect(screen.queryByText('Height (cm)')).not.toBeOnTheScreen();
  });
});

describe('Container', () => {
  it('should render children', async () => {
    render(
      <Container>
        <Text>content</Text>
      </Container>,
    );

    expect(await screen.findByText('content')).toBeOnTheScreen();
  });

  it('should apply additional style when style prop is provided', async () => {
    render(
      <Container style={{ backgroundColor: 'red' }}>
        <Text>content</Text>
      </Container>,
    );

    expect(await screen.findByText('content')).toBeOnTheScreen();
  });
});
