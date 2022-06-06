import {useEffect, useReducer} from 'react';

export function useRerender(interval: number, condition: boolean) {
  const [, forceReload] = useReducer((flag) => !flag, false);
  useEffect(() => {
    if (condition) {
      const eachSecondExtrapolation = setInterval(forceReload, interval);

      return () => clearInterval(eachSecondExtrapolation);
    }
  }, [condition, interval]);
}
