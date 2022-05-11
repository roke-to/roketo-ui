import React from 'react';
import classNames from 'classnames';

import {env} from 'shared/config';
import {TimePeriod} from 'shared/constants';

import {WalletIcon} from '@ui/icons/Wallet';
import {IncomeIcon} from '@ui/icons/Income';
import {OutcomeIcon} from '@ui/icons/Outcome';
import {Balance, DisplayMode} from 'shared/components/Balance';

import {StreamType, TokenAmountSpeed} from '../TokenAmountSpeed';

import styles from './styles.module.scss';

export const FinancialActivity = ({ className }: { className: string }) => (
    <div className={classNames(styles.root, className)}>
      {/* Total Outcome Speed */}
      <div className={styles.wrapper}>
        <OutcomeIcon />
        <TokenAmountSpeed
          className={styles.balance}
          type={StreamType.outcome}
          period={TimePeriod.Hour}
        />
      </div>

      {/* Total Income Speed */}
      <div className={styles.wrapper}>
        <IncomeIcon />
        <TokenAmountSpeed
          className={styles.balance}
          type={StreamType.income}
          period={TimePeriod.Hour}
        />
      </div>

      {/* Balance */}
      <div className={styles.wrapper}>
        <WalletIcon />
        <Balance
          className={styles.balance}
          tokenAccountId={env.WNEAR_ID}
          mode={DisplayMode.USD}
        />
      </div>
    </div>
  );
