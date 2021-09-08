import React from 'react';
import {AccountStreamCard} from './AccountStreamCard';
import useSWR from 'swr';
import {useNear} from '../features/near-connect';

const _STREAMS = [];

export function AccountColumn({
  account,
  header,
  icon,
  tokensField,
  streamsIds,
  period,
}) {
  const near = useNear();

  async function fetchStreams(streamsIds) {
    if (streamsIds === undefined) {
      return _STREAMS;
    }

    return await Promise.all(
      streamsIds.map((streamId) => near.contractApi.getStream({streamId})),
    );
  }

  const {data: streams} = useSWR(
    () => {
      const key = account ? '/streams/' + account.account_id : false;
      return key;
    },
    () => fetchStreams(streamsIds),
  );

  let streamGroups = {};
  if (streams !== undefined) {
    streamGroups = streams.reduce((groups, item) => {
      const group = groups[item.token_name] || [];
      group.push(item);
      groups[item.token_name] = group;
      return groups;
    }, {});
  }

  const tokensData = account !== undefined ? account[tokensField] : [];

  return (
    <div>
      <h2 className="twind-text-xl twind-mb-6 twind-flex twind-items-center">
        <span className="twind-mr-3">{icon}</span>
        {header}
      </h2>
      <div>
        {tokensData.map((item) => (
          <AccountStreamCard
            token={item[0]}
            balance={item[1]}
            streamsLength={
              streamGroups[item[0]] ? streamGroups[item[0]].length : 0
            }
            period={period}
          />
        ))}
      </div>
    </div>
  );
}
