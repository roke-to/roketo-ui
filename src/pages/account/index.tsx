import React from 'react';
// import { formatDistance } from 'date-fns';

import { useRoketoContext } from 'app/roketo-context';
import { AccountColumn } from 'shared/components/AccountColumn';
import { StreamWithdrawIcon } from 'shared/icons/StreamWithdraw';
import { StreamOutIcon } from 'shared/icons/StreamOut';
import { StreamInIcon } from 'shared/icons/StreamIn';
import { useAccount } from 'features/roketo-resource';
import { PageError } from 'shared/components/PageError';
import { CroncatButton } from 'features/croncat/CroncatButton';

export function AccountPage() {
  const { auth, roketo, tokens } = useRoketoContext();
  const accountSWR = useAccount({ auth, roketo });
  console.log('tokens', tokens)

  const account = accountSWR.data;
  const pageError = accountSWR.error;

  return (
    <div className="container mx-auto p-12">
      <div className="md:flex justify-between items-center mb-10">
        <h1 className="text-3xl">My Account</h1>
        <div className="flex items-center md:mt-0 mt-4">
          <CroncatButton />
        </div>
      </div>

      {pageError ? (
        <PageError
          className="max-w-2xl mx-auto py-32"
          message={pageError.message}
          onRetry={accountSWR.mutate}
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <AccountColumn
            icon={<StreamInIcon />}
            header="Receiving"
            account={account}
            tokensField="total_incoming"
            key="AccountInputs"
          />
          <AccountColumn
            icon={<StreamOutIcon />}
            header="Sending"
            account={account}
            tokensField="total_outgoing"
            key="AccountOutputs"
          />
          <AccountColumn
            icon={<StreamWithdrawIcon />}
            header="Withdrawn"
            account={account}
            tokensField="total_received"
            key="AccountWithdrawn"
            showPeriod={false}
          />
        </div>
      )}
    </div>
  );
}
