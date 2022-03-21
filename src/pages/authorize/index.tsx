import React from 'react';
import { NearAuthButton } from 'features/near-auth/NearAuthButton';

export function AuthorizePage() {
  return (
    <div className="flex h-screen mx-3">
      <div
        className="lg:m-auto mx-auto my-auto lg:w-2/5 bg-gray-90 rounded-3xl p-5"
        style={{ backgroundColor: '#0D0B26' }}
      >
        <div className="my-24 text-center">
          <h1 className="text-3xl mb-4 font-semibold">
            {' '}
            Login via NEAR Network
            {' '}
          </h1>
          <p className="text-gray">
            Click button below to login or create new account
          </p>
          <NearAuthButton
            variant="main"
            className="mt-10 rounded-lg py-4 px-8"
          />
        </div>
      </div>
    </div>
  );
}
