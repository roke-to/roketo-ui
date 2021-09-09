import React from 'react';
import 'error-polyfill';
// import 'bootstrap/dist/js/bootstrap.bundle';
//import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import {
  HashRouter as Router,
  Link,
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
import {routes} from './lib/routing';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({children, allowed, redirect, ...rest}) {
  return (
    <Route
      {...rest}
      render={({location}) => {
        console.log(`Render ${rest.path}, allowed? ${allowed}`);
        return allowed ? children : redirect;
      }}
    />
  );
}

function AppFn() {
  const near = useCreateNear();

  return (
    <NearContext.Provider value={near}>
      <div className="twind-bg-dark twind-text-white">
        {near.inited ? (
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

              <Route
                exact
                path="/my_streams/:id"
              >
                <StreamPage />
              </Route>
              <PrivateRoute
                exact
                redirect={<Redirect to="/authorize" />}
                allowed={near.auth.signedIn}
                path="/my_streams"
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
