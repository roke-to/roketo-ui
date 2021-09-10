import React, {useMemo, useState} from 'react';
import {AccountStreamCard} from './AccountStreamCard';
import useSWR from 'swr';
import {useNear} from '../features/near-connect';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownOpener,
  Filter,
  FilterOptionWithCounter,
  RadioButton,
} from './kit';
import classNames from 'classnames';
import {useFilter} from '../features/filtering/lib';
import {STREAM_STATUS} from '../features/stream-control/lib';

const _STREAMS = [];

const PERIODS = {
  sec: '/sec',
  min: '/min',
  hour: '/hour',
  day: '/day',
};

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

  const periodsOptions = useFilter({options: PERIODS});

  const [opened, setOpened] = useState(false);
  const [timePeriod] = useState('sec');

  const selectedPeriod = periodsOptions.option;

  return (
    <div>
      <h2 className="twind-text-xl twind-mb-6 twind-flex twind-items-center">
        <span className="twind-mr-3">{icon}</span>
        {header}
        <span className="twind-ml-2">
          <div className="twind-inline-flex twind-items-center twind-relative">
            <DropdownOpener
              minimal={true}
              rounded
              onClick={() => setOpened(!opened)}
            >
              {periodsOptions.options[selectedPeriod]}
            </DropdownOpener>
            <DropdownMenu opened={opened} className="twind-right-0">
              {periodsOptions.optionsArray.map((option, i) => (
                <DropdownMenuItem key={i}>
                  <RadioButton
                    label={option}
                    active={selectedPeriod === option}
                    value={option}
                    onChange={periodsOptions.selectOption}
                  />
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          </div>
        </span>
      </h2>
      <div>
        {tokensData.map((item) => (
          <AccountStreamCard
            token={item[0]}
            balance={item[1]}
            streamsLength={
              streamGroups[item[0]] ? streamGroups[item[0]].length : 0
            }
            period={selectedPeriod}
          />
        ))}
      </div>
    </div>
  );
}
