import {useRef, useEffect} from 'react';

export function usePrev(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
