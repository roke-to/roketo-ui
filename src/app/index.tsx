import React from 'react';
import 'error-polyfill';

import { Routing } from 'pages';
import { RoketoLegacyContextProvider } from 'features/legacy/roketo-context';

import { RoketoContextProvider } from './roketo-context';
import './index.scss';

function App() {
  return (
    <RoketoContextProvider>
      <RoketoLegacyContextProvider>
        <Routing />
      </RoketoLegacyContextProvider>
    </RoketoContextProvider>
  );
}

export default App;
