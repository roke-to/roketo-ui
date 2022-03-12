import React from 'react';
import { formatDistance } from 'date-fns';

import { useRoketoContext } from 'app/roketo-context';
import { AccountColumn } from 'shared/components/AccountColumn';
import { HistoryIcon } from 'shared/icons/History';
import { StreamWithdrawIcon } from 'shared/icons/StreamWithdraw';
import { StreamOutIcon } from 'shared/icons/StreamOut';
import { StreamInIcon } from 'shared/icons/StreamIn';
import { useAccount } from 'features/roketo-resource';
import { PageError } from 'shared/components/PageError';
import { CroncatButton } from 'features/croncat/CroncatButton';

export function AccountPage() {
  const { auth, roketo } = useRoketoContext();
  const accountSWR = useAccount({ auth, roketo });

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

  // async function cronSubscribeClick(e) {
  //   e.preventDefault();
  //   await near.contractApi.startCron();
  // }

  const account = accountSWR.data;
  const pageError = accountSWR.error;

  return (
    <div className="container mx-auto p-12">
      <div className="md:flex justify-between items-center mb-10">
        <h1 className="text-3xl">My Account</h1>
        <div className="flex items-center md:mt-0 mt-4">
          {account && account.last_action !== null ? (
            <div className="mr-12 text-gray flex items-center">
              <span className="mr-2">
                <HistoryIcon />
              </span>

              <span>
                Last updated&nbsp;
                {formatDistance(
                  new Date(Number(account.last_action) / 1000 / 1000),
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
            icon={<StreamInIcon />}
            header="Receiving"
            account={account}
            tokensField="total_incoming"
            streamsType="inputs"
            key="AccountInputs"
          />
          <AccountColumn
            icon={<StreamOutIcon />}
            header="Sending"
            account={account}
            tokensField="total_outgoing"
            streamsType="outputs"
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
