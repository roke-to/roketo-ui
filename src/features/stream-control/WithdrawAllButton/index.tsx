import React from 'react';
import BigNumber from 'bignumber.js';

import {Button} from '@ui/components/Button';

import { Tooltip } from 'shared/kit/Tooltip';
import { useRoketoContext } from 'app/roketo-context';
import { useStreams } from 'features/roketo-resource';
import { TokenImage } from 'shared/kit/TokenImage';
import { testIds } from 'shared/constants';

import { getAvailableToWithdraw, isActiveStream } from 'shared/api/roketo/helpers';

import styles from './styles.module.scss';

export function WithdrawAllButton({ children }: { children: React.ReactNode}) {
  const { tokens, roketo } = useRoketoContext();
  const streamsSWR = useStreams();

  const streams = streamsSWR.data;
  const { inputs = [] } = streams || {};

  const activeInputs = inputs.filter(isActiveStream);

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
        <div className={styles.root}>
          <p className={styles.description}>
            Move all received tokens to your wallet.
          </p>

          <div className={styles.preparedTokensWrapper}>
            {preparedTokenData.length !== 0 && preparedTokenData.map((data) => 
              <div
                key={data.tokenAccountId}
                className={styles.preparedToken}
              >
                <TokenImage tokenAccountId={data.tokenAccountId} />

                <div className={styles.info}>
                  <span className={styles.amount}>{data.amount}</span>
                  <span className={styles.symbol}>{data.symbol}</span>
                </div>
              </div>
            )}

            {preparedTokenData.length === 0 &&
              <p className={styles.description}>
                You have nothing to withdraw
              </p>
            }
          </div>
        </div>
      )}
    >
      <Button
        onClick={handleWithdraw}
        testId={testIds.withdrawAllButton}
      >
        {children}
      </Button>
    </Tooltip>
  );
}