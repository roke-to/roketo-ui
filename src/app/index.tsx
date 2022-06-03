import {useStore} from 'effector-react';
import 'error-polyfill';
import React, {useEffect} from 'react';

import {initWallets, $appLoading} from '~/entities/wallet';
import {RoketoLegacyContextProvider} from '~/features/legacy/roketo-context';
import {Routing} from '~/pages';

import './styles/index.scss';

function App() {
  useEffect(() => {
    initWallets();
  }, []);
  const isLoading = useStore($appLoading);
  return (
    <RoketoLegacyContextProvider>{isLoading ? null : <Routing />}</RoketoLegacyContextProvider>
  );
}

export default App;
