import {useEffect, useRef} from 'react';

export function usePrev<T extends any>(value: T) {
  const ref = useRef<null | T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
