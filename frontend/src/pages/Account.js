import React from 'react';
import {useNear} from '../features/near-connect/useNear';
import {AccountColumn} from '../components/AccountColumn';
import {
  StreamIn,
  StreamOut,
  StreamWithdraw,
  History,
  Cron,
} from '../components/icons';
import {Button} from '../components/kit';
import {useAccount} from '../features/xyiming-resources';
import {formatDistance} from 'date-fns';
import {PageError} from '../components/PageError';
import {CroncatButton} from '../features/croncat/CroncatButton';
import useSWR from 'swr';

const __INPUTS = [];
const __OUTPUTS = [];

export function AccountPage() {
  const near = useNear();
  const accountSWR = useAccount({near});

  // const balanceSWR = useSWR(
  //   () => {
  //     return true;
  //   },
  //   async () => {
  //     const tokenBalances = await Promise.all(
  //       near.tokens.tickers.map(async (ticker) => {
  //         return {balance: await near.tokens.balance(ticker), ticker};
  //       }),
  //     );
  //     return tokenBalances;
  //   },
  // );
  // console.debug(balanceSWR.error);

  async function cronSubscribeClick(e) {
    e.preventDefault();
    await near.contractApi.startCron();
  }

  const account = accountSWR.data;
  console.debug(account);
  const inputs = (account && account.inputs) || __INPUTS;
  const outputs = (account && account.outputs) || __OUTPUTS;

  const pageError = accountSWR.error;

  return (
    <div className="container mx-auto p-12">
      <div className="md:flex justify-between items-center mb-10">
        <h1 className="text-3xl">My Account</h1>
        <div className="flex items-center md:mt-0 mt-4">
          {account && account.last_action !== null ? (
            <div className="mr-12 text-gray flex items-center">
              <span className="mr-2">
                <History />
              </span>

              <span>
                Last updated&nbsp;
                {formatDistance(
                  new Date(account.last_action / 1000 / 1000),
                  new Date(),
                  {
                    addSuffix: true,
                  },
                )}
              </span>
            </div>
          ) : (
            ''
          )}

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
            icon={<StreamIn />}
            header="Receiving"
            account={account}
            tokensField="total_incoming"
            streamsType="inputs"
            key="AccountInputs"
            period="sec"
          />
          <AccountColumn
            icon={<StreamOut />}
            header="Sending"
            account={account}
            tokensField="total_outgoing"
            streamsType="outputs"
            key="AccountOutputs"
            period="sec"
          />
          <AccountColumn
            icon={<StreamWithdraw />}
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
