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

import { MyStreamsPage } from './MyStreamsPage';
import { AccountPage } from './account';
import { AuthorizePage } from './authorize';
import { StreamPage } from './stream';
import { ProfilePage } from './profile';
import { NotificationsPage } from './notifications';

const TRASH_QUERY_PARAMS = ['transactionHashes', 'errorCode', 'errorMessage'];

export function Routing() {
  useEffect(() => {
    // Remove unused search params
    const url = new URL(window.location.href);

    TRASH_QUERY_PARAMS.forEach((param) => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
      }
    });

    window.history.replaceState(null, '', url);
  });

  const { auth } = useRoketoContext();

  const {
    stream,
    account,
    profile,
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
          redirect={<Redirect to={myStreams.path} />}
          allowed={!auth.signedIn}
          path={authorize.path}
        >
          <AuthorizePage />
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
