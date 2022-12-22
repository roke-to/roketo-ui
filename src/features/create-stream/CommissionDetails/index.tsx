import {formatAmount} from '~/shared/api/token-formatter';

import styles from './styles.module.scss';

type CommissionDetailsProps = {
  amount: number;
  tokenSymbol: string;
  tokenDecimals: number;
  commission: number | string;
  deposit: number;
};

export const CommissionDetails = ({
  amount,
  tokenSymbol,
  tokenDecimals,
  commission,
  deposit,
}: CommissionDetailsProps) => (
  <div className={styles.commissionBlock}>
    <div className={styles.commissionTitle}>Total amount and fee: </div>
    <div className={styles.commissionWrap}>
      <div>Amount to be streamed</div>
      <div>
        {amount} {tokenSymbol}
      </div>
      <div>Stream creation fee</div>
      <div>{formatAmount(tokenDecimals, commission)} NEAR</div>
      <div>Storage deposit fee</div>
      <div>{deposit} NEAR</div>
    </div>
  </div>
);
