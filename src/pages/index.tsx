import React, { useEffect } from 'react';

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
import { ROUTES_MAP } from 'shared/helpers/routing';
import { SendPage } from './send';
import { StreamsPage } from './LegacyStreams';
import { MyStreamsPage } from './MyStreamsPage';
import { AccountPage } from './account';
import { AuthorizePage } from './authorize';
import { StreamPage } from './stream';
import { ProfilePage } from './profile';
import { NotificationsPage } from './notifications';

export function Routing() {
  useEffect(() => {
    // Remove unused search params
    const url = new URL(window.location.href);
    const TRANSACTION_HASHES = 'transactionHashes';

    if (url.searchParams.has(TRANSACTION_HASHES)) {
      url.searchParams.delete(TRANSACTION_HASHES);
      window.history.replaceState(null, '', url);
    }
  });

  const { auth } = useRoketoContext();

  const {
    send,
    stream,
    account,
    profile,
    streams,
    myStreams,
    authorize,
    notifications,
  } = ROUTES_MAP;

  return (
    <Router basename={env.PUBLIC_URL}>
      <Header />

      <Switch>
        <PrivateRoute
          exact
          redirect={<Redirect to={send.path} />}
          allowed={!auth.signedIn}
          path={authorize.path}
        >
          <AuthorizePage />
        </PrivateRoute>
        
        <PrivateRoute
          exact
          redirect={<Redirect to={authorize.path} />}
          allowed={auth.signedIn}
          path={send.path}
        >
          <SendPage />
        </PrivateRoute>

        <PrivateRoute
          exact
          redirect={<Redirect to={authorize.path} />}
          allowed={auth.signedIn}
          path={account.path}
        >
          <AccountPage />
        </PrivateRoute>

        <Route exact path={stream.path}>
          <StreamPage />
        </Route>

        <PrivateRoute
          exact
          redirect={<Redirect to={authorize.path} />}
          allowed={auth.signedIn}
          path={myStreams.path}
        >
          <MyStreamsPage />
        </PrivateRoute>

        <PrivateRoute
          exact
          redirect={<Redirect to={authorize.path} />}
          allowed={auth.signedIn}
          path={streams.path}
        >
          <StreamsPage />
        </PrivateRoute>

        <PrivateRoute
          exact
          redirect={<Redirect to={authorize.path} />}
          allowed={auth.signedIn}
          path={profile.path}
        >
          <ProfilePage />
        </PrivateRoute>
        <PrivateRoute
          exact
          redirect={<Redirect to={authorize.path} />}
          allowed={auth.signedIn}
          path={notifications.path}
        >
          <NotificationsPage />
        </PrivateRoute>
      </Switch>
    </Router>
  );
}
