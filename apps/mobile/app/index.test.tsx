import '@/i18n'
import { userEvent } from '@testing-library/react-native'
import { renderRouter, screen, waitFor } from 'expo-router/testing-library'

const renderScreen = () =>
  renderRouter({ index: require('./index').default, results: () => null }, { initialUrl: '/' })

describe('home screen', () => {
  it('should navigate to results with multiple params when form submitted with multiple parameters', async () => {
    const result = renderScreen()

    await userEvent.press(await screen.findByText('Boy'))
    const [ageInput] = await screen.findAllByTestId('text-input-flat')
    await userEvent.type(ageInput, '5')
    await userEvent.press(await screen.findByText('Add parameter'))
    await userEvent.press(await screen.findByText('Height'))
    const [, heightInput] = await screen.findAllByTestId('text-input-flat')
    await userEvent.type(heightInput, '112')
    await userEvent.press(await screen.findByText('Add parameter'))
    await userEvent.press(await screen.findByText('Weight'))
    const [, , weightInput] = await screen.findAllByTestId('text-input-flat')
    await userEvent.type(weightInput, '14')
    await userEvent.press(await screen.findByText('Show grids'))

    await waitFor(() => expect(result.getPathname()).toBe('/results'))
    const params = result.getSearchParams()
    expect(params.gender).toBe('male')
    expect(params.age).toBe('5')
    expect(params.height).toBe('112')
    expect(params.weight).toBe('14')
  })

  it('should navigate to results with single param when form submitted with one parameter', async () => {
    const result = renderScreen()

    await userEvent.press(await screen.findByText('Girl'))
    const [ageInput] = await screen.findAllByTestId('text-input-flat')
    await userEvent.type(ageInput, '3')
    await userEvent.press(await screen.findByText('Add parameter'))
    await userEvent.press(await screen.findByText('Weight'))
    const [, weightInput] = await screen.findAllByTestId('text-input-flat')
    await userEvent.type(weightInput, '14')
    await userEvent.press(await screen.findByText('Show grids'))

    await waitFor(() => expect(result.getPathname()).toBe('/results'))
    const params = result.getSearchParams()
    expect(params.gender).toBe('female')
    expect(params.age).toBe('3')
    expect(params.weight).toBe('14')
    expect(params.height).toBeUndefined()
  })
})
