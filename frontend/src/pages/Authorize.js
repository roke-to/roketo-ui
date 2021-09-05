import React from 'react';
import { NearAuthButton } from '../features/near-auth/NearAuthButton';
import { useNear } from '../features/near-connect/useNear';
import { Redirect } from 'react-router-dom';

export function AuthorizePage() {
  const near = useNear();

  return (
    <div className="twind-my-24 twind-text-center">
      <h1 className="twind-text-3xl twind-mb-4 twind-font-semibold">
        {' '}
        Login via NEAR Network{' '}
      </h1>
      <p className="twind-text-gray">
        Click button below to login or create new account
      </p>
      <NearAuthButton className="twind-mt-10" />
    </div>
  );
}
