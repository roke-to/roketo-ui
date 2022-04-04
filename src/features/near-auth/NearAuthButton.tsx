import React from 'react';

import { useRoketoContext } from 'app/roketo-context';
import { Button } from 'shared/kit/Button';

type NearAuthButtonProps = {
  variant?: string;
  className?: string;
};

export function NearAuthButton({ variant, className }: NearAuthButtonProps) {
  const {
    auth: {
      logout,
      login,
      accountId,
      signedIn,
    }
  } = useRoketoContext();

  return signedIn ? (
    <Button type="button" onClick={logout} variant={variant} className={className}>
      Sign out (
      {accountId}
      )
    </Button>
  ) : (
    <Button type="button" onClick={login} variant={variant} className={className}>
      Sign in with NEAR Wallet
    </Button>
  );
}
