import React from 'react';

import { useRoketoContext } from 'app/roketo-context';
import { Button } from 'shared/kit/Button';

type NearAuthButtonProps = {
  variant?: string;
  className?: string;
};

export function NearAuthButton(props: NearAuthButtonProps) {
  const {
    auth: {
      logout,
      login,
      accountId,
      signedIn,
    }
  } = useRoketoContext();

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
