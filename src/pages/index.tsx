import {useStore} from 'effector-react';
import {useEffect} from 'react';
import {HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

import {$isSignedIn} from '~/entities/wallet';
import {LEGACY_ROUTES_MAP, LegacyStreamPage, LegacyStreamsPage} from '~/features/legacy';
import {Header} from '~/shared/components/Header';
import {PrivateRoute} from '~/shared/components/PrivateRoute';
import {env} from '~/shared/config';
import {ROUTES_MAP} from '~/shared/lib/routing';
import {Footer} from '~/widgets/footer';

import {AuthorizePage} from './authorize';
import {NotFoundPage} from './not-found';
import {StreamPage} from './stream';
import {StreamsPage} from './streams';

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

  const signedIn = useStore($isSignedIn);

  const {root, stream, streams, authorize} = ROUTES_MAP;

  const {legacyStream, legacyStreams} = LEGACY_ROUTES_MAP;

  return (
    <Router basename={env.PUBLIC_URL}>
      <Header />

      <Switch>
        <PrivateRoute
          exact
          redirect={<Redirect to={streams.path} />}
          allowed={!signedIn}
          path={root.path}
        >
          <Redirect to={authorize.path} />
        </PrivateRoute>

        <PrivateRoute
          exact
          redirect={<Redirect to={streams.path} />}
          allowed={!signedIn}
          path={authorize.path}
        >
          <AuthorizePage />
        </PrivateRoute>

        <Route exact path={legacyStream.path}>
          <LegacyStreamPage />
        </Route>

        <PrivateRoute
          exact
          redirect={<Redirect to={authorize.path} />}
          allowed={signedIn}
          path={legacyStreams.path}
        >
          <LegacyStreamsPage />
        </PrivateRoute>

        <Route exact path={stream.path}>
          <StreamPage />
        </Route>

        <PrivateRoute
          exact
          redirect={<Redirect to={authorize.path} />}
          allowed={signedIn}
          path={streams.path}
        >
          <StreamsPage />
        </PrivateRoute>

        <Route render={NotFoundPage} />
      </Switch>

      <Footer />
    </Router>
  );
}
