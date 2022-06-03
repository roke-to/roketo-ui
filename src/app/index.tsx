import 'error-polyfill';
import React, {useEffect} from 'react';
import {useStore} from 'effector-react';
import {Routing} from '~/pages';
import {initWallets, $appLoading} from '~/entities/wallet';
import { RoketoLegacyContextProvider } from '~/features/legacy/roketo-context';

import './styles/index.scss';

function App() {
  useEffect(() => {
    initWallets();
  }, []);
  const isLoading = useStore($appLoading);
  return (
    <RoketoLegacyContextProvider>
      {isLoading ? null : <Routing />}
    </RoketoLegacyContextProvider>
  );
}

export default App;
