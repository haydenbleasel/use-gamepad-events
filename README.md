# useGamepadEvents

`useGamepadEvents` is a tiny, SSR-friendly hook for listening to gamepad events. It's a wrapper around the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API) designed for firing events in response to gamepad button presses, as opposed to polling for button states. It's designed to be used with [React](https://reactjs.org/) and exposes an event emitter interface.

## Installation

```bash
yarn add @haydenbleasel/use-gamepad-events
```

## Usage

Here's a simple example of how to use `useGamepadEvents` to listen for 'a' button presses:

```tsx
import { useGamepadEvents } from '@haydenbleasel/use-gamepad-events';

const App = () => {
  const gamepadEvents = useGamepadEvents({
    onConnect: (gamepad) => console.log(`Gamepad ${gamepad.id} connected`),
    onDisconnect: () => console.log('Gamepad disconnected'),
    onReady: () => console.log('Gamepad ready'),
  });

  gamepadEvents.on('a', () => {
    console.log('A button pressed');
  });

  return <p>Hello, world.</p>;
};
```

Here's a more complex example that uses multiple gamepad event emitters to control the `window`.

```tsx
const useGamepadNavigation = (): void => {
  const { open } = useCommandBar();
  const gamepadEvents = useGamepadEvents({
    onReady: (gamepad) => {
      window.alert(
        `${gamepad.id} connected. Press START to reload the page, SELECT to go back and use the D-Pad to navigate.`
      );
    },
  });

  gamepadEvents.on('options', window.reload);
  gamepadEvents.on('share', window.back);

  gamepadEvents.on('down', () => {
    if (typeof window === 'undefined' || open) {
      return;
    }

    window.scrollTo({ top: window.scrollY + window.innerHeight });
  });

  gamepadEvents.on('up', () => {
    if (typeof window === 'undefined' || open) {
      return;
    }

    window.scrollTo({ top: window.scrollY - window.innerHeight });
  });
};
```

## Known issues

Currently due to the amount of re-renders, it's difficult to capture a sequence of events e.g.

```tsx
const gamepadEvents = useGamepadEvents();
const [sequence, setSequence] = useState<string[]>([]);

buttons.forEach((button) => {
  gamepadEvents.on(button, () => {
    setSequence([...sequence, button]);
  });
});

console.log(sequence);
```

The sequence array is updated, but the re-renders cause the array to be reset to an empty array.

Really want to get this working to make it easier to capture something like a Konami code.

If you can think of a way to solve this, please let me know!
