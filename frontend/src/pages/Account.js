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

const __INPUTS = [];
const __OUTPUTS = [];

export function AccountPage() {
  const near = useNear();
  const accountSWR = useAccount({near});

  async function cronSubscribeClick(e) {
    e.preventDefault();
    await near.contractApi.startCron();
  }

  const account = accountSWR.data;

  const inputs = (account && account.inputs) || __INPUTS;
  const outputs = (account && account.outputs) || __OUTPUTS;

  console.log('ACCOUNT', account);
  console.log('INPUTS', inputs);
  console.log('OUTPUTS', outputs);

  const pageError = accountSWR.error;

  return (
    <div className="twind-container twind-mx-auto twind-p-12">
      <div className="twind-flex twind-justify-between twind-items-center twind-mb-10">
        <h1 className="twind-text-3xl">My Account</h1>
        <div className="twind-flex twind-items-center">
          <div className="twind-mr-12 twind-text-gray twind-flex twind-items-center">
            <span className="twind-mr-2">
              <History />
            </span>
            {account !== undefined ? (
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
            ) : (
              ''
            )}
          </div>
          <div>
            <Button
              variant="main"
              size="normal"
              className="twind-p-0"
              onClick={(e) => cronSubscribeClick(e)}
            >
              <span className="twind-mr-2">
                <Cron />
              </span>
              Subscribe to CRON
            </Button>
          </div>
        </div>
      </div>

      {pageError ? (
        <PageError
          className="twind-max-w-2xl twind-mx-auto twind-my-32"
          message={pageError.message}
          messaonClick={accountSWR.mutate}
        />
      ) : (
        <div className="twind-grid twind-grid-cols-3 twind-gap-4">
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
