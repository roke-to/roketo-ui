import { Route } from 'react-router-dom';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.

type PrivateRouteProps = {
  children: React.ReactNode;
  allowed: boolean;
  redirect: React.ReactNode;
  path: string;
  exact?: boolean;
}

export function PrivateRoute({
  children,
  allowed,
  redirect,
  path,
  exact = false
}: PrivateRouteProps) {
  return (
    <Route
      exact={exact}
      path={path}
      render={() => (allowed ? children : redirect)}
    />
  );
}