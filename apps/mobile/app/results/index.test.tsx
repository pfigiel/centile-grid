import { handlers } from '@/api/tests/handlers'
import { TestQueryClientProvider } from '@/test/providers/TestQueryClientProvider'
import { renderRouter, screen, waitFor } from 'expo-router/testing-library'
import { setupServer } from 'msw/node'
import page from './index'

const mockDataPoint = {
  age: 5,
  c3: 100,
  c10: 105,
  c25: 110,
  c50: 115,
  c75: 120,
  c90: 125,
  c97: 130,
}

const server = setupServer(handlers.chart.getChartData.success({ data: [mockDataPoint] }))

const renderScreen = (url: string) =>
  renderRouter(
    { index: () => null, results: page },
    { initialUrl: url, wrapper: TestQueryClientProvider },
  )

describe('results screen', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterEach(() => {
    jest.useRealTimers()
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  it('should render height chart when height param present', async () => {
    renderScreen('/results?gender=male&age=5&height=112')

    expect(await screen.findByText('Height (cm)')).toBeOnTheScreen()
    expect(await screen.findByText('Age (years)')).toBeOnTheScreen()
  })

  it('should render weight chart when weight param present', async () => {
    renderScreen('/results?gender=male&age=5&weight=20')

    expect(await screen.findByText('Weight (kg)')).toBeOnTheScreen()
  })

  it('should render both charts when height and weight params present', async () => {
    renderScreen('/results?gender=male&age=5&height=112&weight=20')

    expect(await screen.findByText('Height (cm)')).toBeOnTheScreen()
    expect(await screen.findByText('Weight (kg)')).toBeOnTheScreen()
  })

  it('should navigate back to index when chart data request fails', async () => {
    server.use(handlers.chart.getChartData.error())

    const result = renderScreen('/results?gender=male&age=5&height=112')

    await waitFor(() => expect(result.getPathname()).toBe('/'))
  })

  it('should render centile label when height param present', async () => {
    renderScreen('/results?gender=male&age=5&height=112')

    expect(await screen.findByText('Height')).toBeOnTheScreen()
    expect(await screen.findByText('c25 - c50')).toBeOnTheScreen()
  })

  it('should render centile label when weight param present', async () => {
    renderScreen('/results?gender=male&age=5&weight=20')

    expect(await screen.findByText('Weight')).toBeOnTheScreen()
    expect(await screen.findByText('< c3')).toBeOnTheScreen()
  })

  it('should render centile labels for both params when both present', async () => {
    renderScreen('/results?gender=male&age=5&height=112&weight=20')

    expect(await screen.findByText('Height')).toBeOnTheScreen()
    expect(await screen.findByText('c25 - c50')).toBeOnTheScreen()
    expect(await screen.findByText('Weight')).toBeOnTheScreen()
    expect(await screen.findByText('< c3')).toBeOnTheScreen()
  })
})
