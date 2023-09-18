import {useStore} from 'effector-react';

import {$accountId} from '~/entities/wallet';

import {env} from '~/shared/config';

import {MunzenWidget} from '../MunzenWidget';
import styles from '../styles.module.scss';

export function TopUpPage() {
  const accountId = useStore($accountId);

  if (!accountId) {
    return <div className={styles.layout} />;
  }

  return (
    <div className={styles.layout}>
      <div className={styles.widgetContainer}>
        <MunzenWidget
          params={{
            apiKey: env.MUNZEN_API_KEY,
            toCurrency: 'NEAR',
            toWallet: accountId,
          }}
        />
      </div>
    </div>
  );
}
