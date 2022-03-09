import React from 'react';
import { Button } from '../../components/kit/Button';
import { useNearAuth } from './useNearAuth';

export function NearAuthButton(props) {
  const {
    inited, logout, login, accountId, signedIn,
  } = useNearAuth();

  if (!inited) {
    return (
      <Button type="button" {...props}>
        Connecting...
        {' '}
        <span
          className="spinner-grow spinner-grow-sm"
          role="status"
          aria-hidden="true"
        />
      </Button>
    );
  }

  return signedIn ? (
    <Button type="button" onClick={logout} {...props}>
      Sign out (
      {accountId}
      )
    </Button>
  ) : (
    <Button type="button" onClick={login} {...props}>
      Sign in with NEAR Wallet
    </Button>
  );
}
