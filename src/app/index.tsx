import 'error-polyfill';
import {useEffect} from 'react';
import {useStore} from 'effector-react';
import {Routing} from 'pages';
import {initWallets, $appLoading} from 'services/wallet';
import { RoketoLegacyContextProvider } from 'features/legacy/roketo-context';

import './index.scss';

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
