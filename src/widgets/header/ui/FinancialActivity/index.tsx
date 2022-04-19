import React from 'react';

import {env} from 'shared/config';
import {TimePeriod} from 'shared/constants';

import {WalletIcon} from '@uikit/icons/Wallet';
import {IncomeIcon} from '@uikit/icons/Income';
import {OutcomeIcon} from '@uikit/icons/Outcome';
import {Balance} from 'shared/components/Balance';

import {TokenAmountSpeed} from '../TokenAmountSpeed';

import styles from './styles.module.scss';

export const FinancialActivity = () => (
    <div className={styles.root}>
      {/* Total Outcome Speed */}
      <div className={styles.wrapper}>
        <OutcomeIcon />
        <TokenAmountSpeed
          className={styles.balance}
          type='outcome'
          period={TimePeriod.Hour}
        />
      </div>

      {/* Total Income Speed */}
      <div className={styles.wrapper}>
        <IncomeIcon />
        <TokenAmountSpeed
          className={styles.balance}
          type='income'
          period={TimePeriod.Hour}
        />
      </div>

      {/* Balance */}
      <div className={styles.wrapper}>
        <WalletIcon />
        <Balance
          className={styles.balance}
          tokenAccountId={env.WNEAR_ID}
          mode="usd"
        />
      </div>
    </div>
  );
