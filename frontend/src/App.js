import React from 'react';
import 'error-polyfill';
import './App.scss';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import SendPage from './pages/Send';
import {Header} from './components/Header';
import {NearContext, useCreateNear} from './features/near-connect/useNear';
import {MyStreamsPage} from './pages/MyStreams';
import {AccountPage} from './pages/Account';
import {AuthorizePage} from './pages/Authorize';
import {StreamPage} from './pages/StreamPage';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({children, allowed, redirect, ...rest}) {
  return (
    <Route
      {...rest}
      render={({location}) => {
        return allowed ? children : redirect;
      }}
    />
  );
}

function AppFn() {
  const near = useCreateNear();

  const inited = near.inited;

  return (
    <NearContext.Provider value={near}>
      <div className="bg-dark text-white">
        {inited ? (
          <Router basename={process.env.PUBLIC_URL}>
            <Header />

            <Switch>
              <PrivateRoute
                exact
                redirect={<Redirect to="/" />}
                allowed={!near.auth.signedIn}
                path="/authorize"
              >
                <AuthorizePage />
              </PrivateRoute>
              <PrivateRoute
                exact
                redirect={<Redirect to="/authorize" />}
                allowed={near.auth.signedIn}
                path="/"
              >
                <SendPage />
              </PrivateRoute>
              <PrivateRoute
                exact
                redirect={<Redirect to="/authorize" />}
                allowed={near.auth.signedIn}
                path="/account"
              >
                <AccountPage />
              </PrivateRoute>

              <Route exact path="/streams/:id">
                <StreamPage />
              </Route>
              <PrivateRoute
                exact
                redirect={<Redirect to="/authorize" />}
                allowed={near.auth.signedIn}
                path="/streams"
              >
                <MyStreamsPage />
              </PrivateRoute>
            </Switch>
          </Router>
        ) : null}
      </div>
    </NearContext.Provider>
  );
}

export default AppFn;
