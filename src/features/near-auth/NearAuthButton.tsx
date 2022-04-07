import React from 'react';

import { useRoketoContext } from 'app/roketo-context';
import { Button } from 'shared/kit/Button';
import { useUser } from 'shared/api/roketo-web';

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

  const userSWR = useUser();
  const { name, email } = userSWR.data || {};

  return signedIn ? (
    <Button type="button" onClick={logout} variant={variant} className={className}>
      Sign out (
      {name || accountId}
      <img src={`http://localhost:3000/users/${accountId}/avatar?email=${email}`} style={{ width: 32, height: 32, borderRadius: 16, margin: '0 2px 0 5px' }} alt="" />
      )
    </Button>
  ) : (
    <Button type="button" onClick={login} variant={variant} className={className}>
      Sign in with NEAR Wallet
    </Button>
  );
}
