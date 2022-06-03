import React from 'react';
import {useStore} from 'effector-react';

import {Button, DisplayMode} from '@ui/components/Button';
import { Tooltip } from 'shared/kit/Tooltip';
import { TokenImage } from 'shared/kit/TokenImage';
import { testIds } from 'shared/constants';

import styles from './styles.module.scss';
import {$tokenData, triggerWithdrawAll} from './model';

export function WithdrawAllButton() {
  const preparedTokenData = useStore($tokenData)
  return (
    <Tooltip
      placement="bottom"
      align={{ offset: [0, 20] }}
      overlay={(
        <div className={styles.root}>
          <p className={styles.description}>
            Move all received tokens to your wallet.
          </p>

          <div className={styles.preparedTokensWrapper} data-testid={testIds.withdrawTooltip}>
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
        onClick={() => triggerWithdrawAll()}
        testId={testIds.withdrawAllButton}
        displayMode={preparedTokenData.length !== 0 ? DisplayMode.action : DisplayMode.secondary}
        className={preparedTokenData.length !== 0 ? undefined : styles.notAllowed}
      >
        Withdraw tokens
      </Button>
    </Tooltip>
  );
}
