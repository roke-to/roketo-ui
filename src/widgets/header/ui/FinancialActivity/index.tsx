import classNames from 'classnames';
import {useStoreMap} from 'effector-react';

import {env} from '~/shared/config';
import {TIME_PERIOD_SIGNS, TimePeriod} from '~/shared/constants';

import {WalletIcon} from '@ui/icons/Wallet';
import {IncomeIcon} from '@ui/icons/Income';
import {OutcomeIcon} from '@ui/icons/Outcome';
import {Balance, DisplayMode} from '~/shared/components/Balance';

import {StreamType} from '../../streamType';
import {$totalUSDAmountPerHour} from '../../model';

import styles from './styles.module.scss';

const TokenAmountSpeed = ({
  type,
  className,
}: {
  type: StreamType;
  className: string;
}) => {
  const totalAmountInUSD = useStoreMap({
    store: $totalUSDAmountPerHour,
    keys: [type],
    fn: (totalAmounts) => totalAmounts[type],
  });

  return (
    <div className={className}>
      {`${totalAmountInUSD} $ ${TIME_PERIOD_SIGNS[TimePeriod.Hour]}`}
    </div>
  );
};

export const FinancialActivity = ({className}: {className: string}) => (
  <div className={classNames(styles.root, className)}>
    {/* Total Outcome Speed */}
    <div className={styles.wrapper}>
      <OutcomeIcon />
      <TokenAmountSpeed className={styles.balance} type={StreamType.outcome} />
    </div>

    {/* Total Income Speed */}
    <div className={styles.wrapper}>
      <IncomeIcon />
      <TokenAmountSpeed className={styles.balance} type={StreamType.income} />
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
