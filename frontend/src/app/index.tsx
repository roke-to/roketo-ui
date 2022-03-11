import React from 'react';
import 'error-polyfill';

import { Routing } from 'pages';

import { RoketoContextProvider } from './roketo-context';
import './index.scss';

function App() {

  return (
    <RoketoContextProvider>
      <div className="bg-dark text-white">
        <Routing />
      </div>
    </RoketoContextProvider>
  );
}

export default App;
