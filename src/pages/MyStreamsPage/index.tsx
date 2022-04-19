import React from 'react';
import cn from 'classnames';

import {ROUTES_MAP} from 'shared/helpers/routing';

import {Layout} from '@uikit/components/Layout';
import {Button} from 'shared/ui/kit/components/Button';

import {WithdrawAllButton} from 'features/stream-control/WithdrawAllButton';
import {FinancialStatus} from 'widgets/financialStatus';

import styles from './styles.module.scss';

export const MyStreamsPage = () => {
  const a = 'My streams Page';
  return (
    <div className={styles.root}>
      <Layout>
        <section className={cn(styles.flex, styles.spaceBetween)}>
          <h1 className={styles.title}>Streams</h1>

          <div className={cn(styles.flex, styles.buttonsWrapper)}>
            <WithdrawAllButton>Withdraw tokens</WithdrawAllButton>

            <Button link={ROUTES_MAP.send.path}>Create stream</Button>
          </div>
        </section>

        <FinancialStatus className={styles.section} />

        {a}
      </Layout>
    </div>

  );
};

export default MyStreamsPage;

