import { render, screen } from '@testing-library/react-native'
import { ComponentProps } from 'react'
import { Text } from 'react-native'
import { Container } from './Container'

const renderComponent = (props: Partial<ComponentProps<typeof Container>> = {}) =>
  render(
    <Container {...props}>
      <Text>content</Text>
    </Container>,
  )

describe('Container', () => {
  it('should render children when rendered without custom styles', async () => {
    renderComponent()

    expect(await screen.findByText('content')).toBeOnTheScreen()
  })

  it('should render children when custom container style provided', async () => {
    renderComponent({ styles: { container: { margin: 8 } } })

    expect(await screen.findByText('content')).toBeOnTheScreen()
  })

  it('should render children when custom innerContainer style provided', async () => {
    renderComponent({ styles: { innerContainer: { padding: 24 } } })

    expect(await screen.findByText('content')).toBeOnTheScreen()
  })
})
