import cn from 'classnames';
import React, {useMemo, useState} from 'react';

import {Layout} from '@ui/components/Layout';

import {LegacyRoketoStream} from '../api/roketo/interfaces/entities';
import {useAccount, useLegacyStreams} from '../roketo-resource';
import {WithdrawAllButton} from '../stream-control/WithdrawAllButton';
import {StreamFilters} from './filtering/StreamFilters';
import {StreamsList} from './streamsList';
import styles from './styles.module.scss';

export const LegacyStreamsPage = () => {
  const accountSWR = useAccount();

  const {data: streams} = useLegacyStreams({account: accountSWR.data});
  const {inputs, outputs} = streams || {};
  const allStreams = useMemo<LegacyRoketoStream[] | undefined>(
    () => (inputs || outputs) && [...(inputs || []), ...(outputs || [])],
    [inputs, outputs],
  );

  const [filteredItems, setFiltered] = useState<LegacyRoketoStream[] | undefined>([]);

  return (
    <div className={styles.root}>
      <Layout>
        <section className={cn(styles.flex, styles.header)}>
          <h1 className={styles.title}>Streams (legacy)</h1>

          <div className={cn(styles.flex, styles.buttonsWrapper)}>
            <WithdrawAllButton>Withdraw all</WithdrawAllButton>
          </div>
        </section>

        <StreamFilters
          items={allStreams}
          onFilterDone={setFiltered}
          className={styles.streamFilters}
        />

        <StreamsList displayingStreams={filteredItems} className={styles.section} />
      </Layout>
    </div>
  );
};

export function useShowLegacyStreams() {
  const accountSWR = useAccount();

  const {data: streams} = useLegacyStreams({account: accountSWR.data});

  return streams && (streams.inputs.length > 0 || streams.outputs.length > 0);
}
