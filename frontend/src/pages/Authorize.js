import React from 'react';
import {NearAuthButton} from '../features/near-auth/NearAuthButton';

export function AuthorizePage() {
  return (
    <div className="twind-flex twind-h-screen twind-mx-3">
      <div
        className="lg:twind-m-auto twind-mx-auto twind-my-auto lg:twind-w-2/5 twind-bg-gray-90 twind-rounded-3xl twind-p-5"
        style={{'background-color': '#0D0B26'}}
      >
        <div className="twind-my-24 twind-text-center">
          <h1 className="twind-text-3xl twind-mb-4 twind-font-semibold">
            {' '}
            Login via NEAR Network{' '}
          </h1>
          <p className="twind-text-gray">
            Click button below to login or create new account
          </p>
          <NearAuthButton
            variant="main"
            className="twind-mt-10 twind-rounded-lg twind-py-4 twind-px-8"
          />
        </div>
      </div>
    </div>
  );
}
