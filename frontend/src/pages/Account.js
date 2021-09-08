import React, {useMemo, useState} from 'react';
import {useNear} from '../features/near-connect/useNear';
import useSWR from 'swr';
import {AccountColumn} from '../components/AccountColumn';
import {StreamFilters} from '../features/filtering/streams';
import {
  StreamIn,
  StreamOut,
  StreamWithdraw,
  History,
  Cron,
} from '../components/icons';
import {Button} from '../components/kit';

const __INPUTS = [];
const __OUTPUTS = [];

export function AccountPage() {
  const near = useNear();

  const {data: account} = useSWR(
    ['account', near.near.accountId],
    near.contractApi.getCurrentAccount,
    {
      errorRetryInterval: 250,
    },
  );

  const inputs = (account && account.inputs) || __INPUTS;
  const outputs = (account && account.outputs) || __OUTPUTS;

  console.log('ACCOUNT', account);
  console.log('INPUTS', inputs);
  console.log('OUTPUTS', outputs);

  return (
    <div className="twind-container mx-auto twind-p-12">
      <div className="twind-flex twind-justify-between twind-items-center twind-mb-10">
        <h1 className="twind-text-3xl">My Account</h1>
        <div className="twind-flex twind-items-center">
          <div className="twind-mr-12 twind-text-gray twind-flex twind-items-center">
            <span className="twind-mr-2">
              <History />
            </span>
            Last updated 2 hours ago
          </div>
          <div>
            <Button variant="main" className="twind-p-0">
              <span className="twind-mr-2">
                <Cron />
              </span>
              Subscribe to CRON
            </Button>
          </div>
        </div>
      </div>

      <div className="twind-grid twind-grid-cols-3 twind-gap-4">
        <AccountColumn
          icon={<StreamIn />}
          header="Receiving"
          account={account}
          tokensField="total_incoming"
          streamsIds={inputs}
          key="AccountInputs"
          period="sec"
        />
        <AccountColumn
          icon={<StreamOut />}
          header="Sending"
          account={account}
          tokensField="total_outgoing"
          streamsIds={outputs}
          key="AccountOutputs"
          period="sec"
        />
        <AccountColumn
          icon={<StreamWithdraw />}
          header="Withdrawn"
          account={account}
          tokensField="total_received"
          key="AccountWithdrawn"
        />
      </div>
    </div>
  );
}
