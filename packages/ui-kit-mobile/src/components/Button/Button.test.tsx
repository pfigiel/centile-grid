import { render, screen, userEvent } from '@testing-library/react-native'
import { ComponentProps } from 'react'
import { PaperProvider } from 'react-native-paper'
import { Button } from './Button'

describe('Button', () => {
  const renderComponent = ({ children, ...props }: Partial<ComponentProps<typeof Button>> = {}) =>
    render(
      <PaperProvider>
        <Button {...props}>{children}</Button>
      </PaperProvider>,
    )

  it('should render children when children prop provided', async () => {
    renderComponent({ children: 'Label' })

    expect(await screen.findByText('Label')).toBeTruthy()
  })

  it('should call onPress when pressed', async () => {
    const onPress = jest.fn()
    const children = 'Press me'
    renderComponent({ children, onPress })

    await userEvent.press(await screen.findByRole('button', { name: children }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('should not call onPress when disabled prop is set', async () => {
    const onPress = jest.fn()
    const children = 'Press me'
    renderComponent({ children, onPress, disabled: true })

    await userEvent.press(await screen.findByRole('button', { name: children }))

    expect(onPress).not.toHaveBeenCalled()
  })

  it('should be accessible as disabled when disabled prop is set', async () => {
    renderComponent({ disabled: true })

    expect(await screen.findByRole('button', { disabled: true })).toBeTruthy()
  })

  it('should apply style when style prop provided', async () => {
    renderComponent({ style: { backgroundColor: 'red' } })

    expect(await screen.findByTestId('button-container')).toHaveStyle({ backgroundColor: 'red' })
  })

  it('should apply styles.label when styles.label prop provided', async () => {
    renderComponent({ children: 'Label', styles: { label: { color: 'blue' } } })

    expect(await screen.findByTestId('button-text')).toHaveStyle({ color: 'blue' })
  })
})
