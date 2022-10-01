import { useEventListener } from '@react-hookz/web';
import { useCallback, useEffect, useState } from 'react';

export type GamepadState = {
  a: boolean;
  b: boolean;
  x: boolean;
  y: boolean;
  l1: boolean;
  l3: boolean;
  r1: boolean;
  r3: boolean;
  share: boolean;
  options: boolean;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  back: boolean;
};

type UseGamepadEventsProps = {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReady?: (gamepad: Gamepad) => void;
  onLoop?: () => void;
};

const defaultState: GamepadState = {
  a: false,
  b: false,
  x: false,
  y: false,
  l1: false,
  l3: false,
  r1: false,
  r3: false,
  share: false,
  options: false,
  up: false,
  down: false,
  left: false,
  right: false,
  back: false,
};

let lastFiredButton: keyof GamepadState | null = null;
// eslint-disable-next-line jest/require-hook
let lastFiredTime = 0;

const useGamepadEvents = (
  props?: UseGamepadEventsProps
): {
  on: (event: keyof GamepadState, callback: () => void) => void;
} => {
  const [gamepad, setGamepad] = useState<number | null>(null);
  const [gamepadState, setGamepadState] = useState<GamepadState>(defaultState);
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const { onReady, onLoop, onConnect, onDisconnect } = props ?? {};

  const gameloop = useCallback(
    (oldState: GamepadState) => {
      onLoop?.();

      if (typeof gamepad !== 'number') {
        window.requestAnimationFrame(() => gameloop(oldState));
        return;
      }

      const activeGamepad = navigator.getGamepads()[gamepad];

      if (!activeGamepad) {
        window.requestAnimationFrame(() => gameloop(oldState));
        return;
      }

      const newState = {
        a: activeGamepad.buttons[0].pressed,
        b: activeGamepad.buttons[1].pressed,
        x: activeGamepad.buttons[2].pressed,
        y: activeGamepad.buttons[3].pressed,
        l1: activeGamepad.buttons[4].pressed,
        l3: activeGamepad.buttons[10].pressed,
        r1: activeGamepad.buttons[5].pressed,
        r3: activeGamepad.buttons[11].pressed,
        share: activeGamepad.buttons[8].pressed,
        options: activeGamepad.buttons[9].pressed,
        up: activeGamepad.buttons[12].pressed,
        down: activeGamepad.buttons[13].pressed,
        left: activeGamepad.buttons[14].pressed,
        right: activeGamepad.buttons[15].pressed,
        back: activeGamepad.buttons[16].pressed,
      };

      /*
       * const leftStick = {
       *   x: Number(activeGamepad.axes[0].toFixed(2)),
       *   y: Number(activeGamepad.axes[1].toFixed(2)),
       * };
       */

      /*
       * const rightStick = {
       *   x: Number(activeGamepad.axes[2].toFixed(2)),
       *   y: Number(activeGamepad.axes[3].toFixed(2)),
       * };
       */

      if (JSON.stringify(newState) !== JSON.stringify(oldState)) {
        setGamepadState(newState);
      }

      const next = () => gameloop(newState);
      window.requestAnimationFrame(next);
    },
    [gamepad, onLoop]
  );

  useEffect(() => {
    if (typeof gamepad !== 'number' || ready) {
      return;
    }

    const newGamepad = navigator.getGamepads()[gamepad];

    if (!newGamepad) {
      return;
    }

    onReady?.(newGamepad);
    setReady(true);
  }, [gamepad, onReady, ready, setReady]);

  useEventListener(
    typeof window === 'undefined' ? null : window,
    'gamepadconnected',
    () => {
      const newGamepads = navigator.getGamepads();
      const activeGamePad = newGamepads.findIndex((gp) => Boolean(gp));

      setGamepad(activeGamePad);
      onConnect?.();
    },
    { passive: true }
  );

  useEventListener(
    typeof window === 'undefined' ? null : window,
    'gamepaddisconnected',
    () => {
      setGamepad(null);
      onDisconnect?.();
    },
    { passive: true }
  );

  useEffect(() => {
    if (typeof gamepad === 'number') {
      return;
    }

    const newGamepads = navigator.getGamepads();
    const activeGamePad = newGamepads.findIndex((gp) => Boolean(gp));

    if (activeGamePad === -1) {
      return;
    }

    setGamepad(activeGamePad);
  }, [gamepad]);

  useEffect(() => {
    if (typeof gamepad !== 'number' || running) {
      return;
    }

    gameloop(gamepadState);
    setRunning(true);
  }, [gameloop, gamepad, gamepadState, running]);

  const on = (event: keyof GamepadState, callback: () => void) => {
    if (!gamepadState[event]) {
      return;
    }

    const now = Date.now();

    if (!lastFiredButton || !lastFiredTime || lastFiredButton !== event) {
      lastFiredButton = event;
      lastFiredTime = now;
      callback();
      return;
    }

    if (now - lastFiredTime < 100 && lastFiredButton === event) {
      lastFiredTime = now;
      return;
    }

    lastFiredTime = now;
    callback();
  };

  return { on };
};

export default useGamepadEvents;
