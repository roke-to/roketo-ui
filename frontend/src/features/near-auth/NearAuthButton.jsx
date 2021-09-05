import React from 'react';
import { Button } from '../../components/kit';
import { useNearAuth } from './useNearAuth';

export function NearAuthButton(props) {
  const { inited, logout, login, accountId, signedIn } = useNearAuth();

  if (!inited) {
    return (
      <Button {...props}>
        Connecting...{' '}
        <span
          className="spinner-grow spinner-grow-sm"
          role="status"
          aria-hidden="true"
        />
      </Button>
    );
  }

  return signedIn ? (
    <Button onClick={logout} {...props}>
      Sign out ({accountId})
    </Button>
  ) : (
    <Button onClick={login} {...props}>
      Sign in with NEAR Wallet
    </Button>
  );
}
