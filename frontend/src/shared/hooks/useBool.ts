import React from 'react';

export function useBool(initial: boolean) {
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
