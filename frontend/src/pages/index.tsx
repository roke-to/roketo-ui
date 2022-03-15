import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import { Header } from 'shared/components/Header';
import { PrivateRoute } from 'shared/components/PrivateRoute';
import { useRoketoContext } from 'app/roketo-context';

import { env } from 'shared/config';
import { routes } from 'shared/helpers/routing';
import { SendPage } from './send';
import { StreamsPage } from './streams';
import { AccountPage } from './account';
import { AuthorizePage } from './authorize';
import { StreamPage } from './stream';

export function Routing() {
  const { auth } = useRoketoContext();

  return (
    <Router basename={env.PUBLIC_URL}>
      <Header />

      <Switch>
        <PrivateRoute
          exact
          redirect={<Redirect to={routes.send} />}
          allowed={!auth.signedIn}
          path={routes.authorize}
        >
          <AuthorizePage />
        </PrivateRoute>
        
        <PrivateRoute
          exact
          redirect={<Redirect to={routes.authorize} />}
          allowed={auth.signedIn}
          path={routes.send}
        >
          <SendPage />
        </PrivateRoute>

        <PrivateRoute
          exact
          redirect={<Redirect to={routes.authorize} />}
          allowed={auth.signedIn}
          path={routes.account}
        >
          <AccountPage />
        </PrivateRoute>

        <Route exact path={routes.streamPattern}>
          <StreamPage />
        </Route>

        <PrivateRoute
          exact
          redirect={<Redirect to={routes.authorize} />}
          allowed={auth.signedIn}
          path={routes.streams}
        >
          <StreamsPage />
        </PrivateRoute>
      </Switch>
    </Router>
  );
}