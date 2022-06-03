import React from 'react';

export type BooleanControl = {
  on: boolean;
  off: boolean;
  toggle: () => void;
  turnOff: () => void;
  turnOn: () => void;
  setOn: (state: boolean) => void;
};

export function useBool(initial: boolean): BooleanControl {
  const [on, setOn] = React.useState(initial);

  return {
    on,
    off: !on,
    toggle: () => setOn(!on),
    turnOff: () => setOn(false),
    turnOn: () => setOn(true),
    setOn,
  };
}
