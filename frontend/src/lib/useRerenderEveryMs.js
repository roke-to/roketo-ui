import {useEffect} from 'react';
import {useBool} from './useBool';

export function useRerenderEveryMs(ms) {
  const {toggle} = useBool(false);

  useEffect(() => {
    if (!ms) {
      return;
    }

    const id = setInterval(() => {
      toggle();
    }, ms);

    return () => clearInterval(id);
  }, [ms, toggle]);
}
