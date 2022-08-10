import {useUnit} from 'effector-react';
import 'error-polyfill';
import React, {useEffect} from 'react';

import {Routing} from '~/pages';

import {RoketoLegacyContextProvider} from '~/features/legacy/roketo-context';

import {$walletLoading} from '~/entities/wallet';

import {appStarted} from '~/shared/init';

import './styles/index.scss';

export function App() {
  useEffect(() => {
    appStarted();
  }, []);
  const isLoading = useUnit($walletLoading);
  return (
    <RoketoLegacyContextProvider>{isLoading ? null : <Routing />}</RoketoLegacyContextProvider>
  );
}
