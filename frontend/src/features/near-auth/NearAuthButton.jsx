import React from 'react';
import { Button } from 'shared/kit/Button';
import { useNearAuth } from './useNearAuth';

export function NearAuthButton(props) {
  const {
    logout,
    login,
    accountId,
    signedIn
  } = useNearAuth();

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
