import React from 'react';
import BigNumber from 'bignumber.js';

import { Button } from 'shared/kit/Button';
import { Tooltip } from 'shared/kit/Tooltip';
import { useRoketoContext } from 'app/roketo-context';
import { useStreams } from 'features/roketo-resource';
import { getAvailableToWithdraw } from 'shared/api/roketo/helpers';
import { TokenImage } from 'shared/kit/TokenImage';
import { STREAM_STATUS } from 'shared/api/roketo/constants';
import { RoketoStream } from 'shared/api/roketo/interfaces/entities';

export function WithdrawAllButton({ children }: { children: React.ReactNode}) {
  const { tokens, roketo } = useRoketoContext();
  const streamsSWR = useStreams();

  const streams = streamsSWR.data;
  const { inputs = [] } = streams || {};

  const activeInputs = inputs.filter((stream: RoketoStream) => 
    stream.status === STREAM_STATUS.Active
  );

  type TmpData = {
    available: BigNumber;
    tokenAccountId: string;
  }

  const tokensData = {} as {[tokenAccountId: string]: TmpData };
  const tmpResult = [] as TmpData[];
  const streamIds = [] as string[];

  // eslint-disable-next-line no-restricted-syntax
  for (const stream of activeInputs) {
    const tokenAccountId = stream.token_account_id;
    const available = getAvailableToWithdraw(stream);

    if (available.toFixed() !== '0') {
      streamIds.push(stream.id);
    }

    if (!tokensData[tokenAccountId]) {
      const value = {
        available,
        tokenAccountId,
      }

      tmpResult.push(value);
      tokensData[tokenAccountId] = value;
    } else {
      tokensData[tokenAccountId].available = tokensData[tokenAccountId].available.plus(available);
    }
  }

  const preparedTokenData = tmpResult.map((value: TmpData) => {
    const { formatter, meta: { symbol } } = tokens[value.tokenAccountId];
    const amount = formatter.amount(value.available.toFixed());

    return {
      tokenAccountId: value.tokenAccountId,
      amount,
      symbol
    }
  });

  const handleWithdraw = () => {
    if (streamIds.length > 0) {
      roketo.api.withdraw({ streamIds })
    }
  }

  return (
    <Tooltip
      placement="bottom"
      align={{ offset: [0, 20] }}
      overlay={(
        <div className="text-left">
          <p className="mb-4 text-gray">
            Move all received tokens to your wallet.
          </p>
          <div className="text-left">
            {preparedTokenData.length !== 0 && preparedTokenData.map((data) => 
              <div
                key={data.tokenAccountId}
                className="inline-flex items-center p-2 rounded-lg bg-card2 w-full mb-2"
              >
                <TokenImage tokenAccountId={data.tokenAccountId} className="mr-2" />
                {' '}
                <div>
                  <span className="font-semibold">{data.amount}</span>
                  {' '}
                  <span className="text-gray">{data.symbol}</span>
                </div>
              </div>
            )}

            {preparedTokenData.length === 0 &&
              <p className="font-semibold text-center">
                You have nothing to withdraw
              </p>
            }
          </div>
        </div>
      )}
    >
      <Button
        type="button"
        loadingText="Updating account..."
        variant="main"
        size="normal"
        onClick={handleWithdraw}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
