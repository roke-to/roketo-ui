import {useStore} from 'effector-react';
import 'error-polyfill';
import React, {useEffect} from 'react';

import {Routing} from '~/pages';

import {RoketoLegacyContextProvider} from '~/features/legacy/roketo-context';

import {$appLoading, initWallets} from '~/entities/wallet';

import './styles/index.scss';

export function App() {
  useEffect(() => {
    initWallets();
  }, []);
  const isLoading = useStore($appLoading);
  return (
    <RoketoLegacyContextProvider>{isLoading ? null : <Routing />}</RoketoLegacyContextProvider>
  );
}
