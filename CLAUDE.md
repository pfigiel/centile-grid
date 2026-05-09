# centile-grid

## Testing conventions

### Test naming

Use `should [behavior] when [condition]` format:

```ts
it('should render height chart when height param present', ...)
it('should navigate to results with correct params when form submitted with height', ...)
it('should call onChangeValue with undefined when text is cleared', ...)
```

### Queries

Always use async `findBy`/`findAllBy` — never `getBy`/`getAllBy`:

```ts
// correct
const input = await screen.findByText('Label');
const [first, second] = await screen.findAllByTestId('text-input-flat');

// wrong
const input = screen.getByText('Label');
```

### User interactions

Use `userEvent` — never `fireEvent`:

```ts
import { userEvent } from '@testing-library/react-native';

await userEvent.press(await screen.findByText('Submit'));
await userEvent.type(input, '5');
await userEvent.clear(input);
```

### Assertions

Use `toBeOnTheScreen()` for visibility:

```ts
expect(await screen.findByText('Height (cm)')).toBeOnTheScreen();
```

### AAA structure

Separate Arrange / Act / Assert with blank lines:

```ts
it('should call onPress when pressed', async () => {
  const onPress = jest.fn();
  renderComponent({ onPress });

  await userEvent.press(await screen.findByRole('button'));

  expect(onPress).toHaveBeenCalledTimes(1);
});
```

### renderComponent / renderScreen helpers

Extract render into a helper at the top of each describe block:

```ts
const renderComponent = (props: Partial<Props> = {}) =>
  render(<MyComponent {...defaultProps} {...props} />);

// for router screens:
const renderScreen = (url: string) =>
  renderRouter(
    { index: () => null, results: require('./results').default },
    { initialUrl: url, wrapper: TestQueryClientProvider },
  );
```
