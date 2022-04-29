import React, {useMemo, useState} from 'react';
import cn from 'classnames';

import {ROUTES_MAP} from 'shared/helpers/routing';

import {Layout} from '@ui/components/Layout';
import {Button} from '@ui/components/Button';

import {WithdrawAllButton} from 'features/stream-control/WithdrawAllButton';
import {useStreams} from 'features/roketo-resource';
import {StreamFilters} from 'features/filtering/StreamFilters';

import {FinancialStatus} from 'widgets/financialStatus';
import {StreamsList} from 'widgets/streamsList';

import {RoketoStream} from 'shared/api/roketo/interfaces/entities';

import styles from './styles.module.scss';

export const MyStreamsPage = () => {
  const [filteredItems, setFiltered] = useState<RoketoStream[] | undefined>([]);

  const {data: streams} = useStreams();
  const {inputs, outputs} = streams || {};

  const allStreams = useMemo<RoketoStream[] | undefined>(
    () => ((inputs || outputs) && [...(inputs || []), ...(outputs || [])]),
    [inputs, outputs]
  );

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

        <FinancialStatus className={styles.section}/>

        <StreamFilters
          items={allStreams}
          onFilterDone={setFiltered}
        />

        {filteredItems &&
          <StreamsList streams={filteredItems} className={styles.section}/>
        }
      </Layout>
    </div>
  );
};

export default MyStreamsPage;

