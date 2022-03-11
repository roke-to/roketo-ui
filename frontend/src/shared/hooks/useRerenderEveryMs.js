import { useEffect } from 'react';
import { useBool } from './useBool';

export function useRerenderEveryMs(ms) {
  const { toggle } = useBool(false);

  return useEffect(() => {
    if (!ms) {
      return undefined;
    }

    const id = setInterval(() => {
      toggle();
    }, ms);

    return () => clearInterval(id);
  }, [ms, toggle]);
}
