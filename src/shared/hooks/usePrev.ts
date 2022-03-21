import { useRef, useEffect } from 'react';

export function usePrev<T extends any>(value: T) {
  const ref = useRef<null | T>(null);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}