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
import {useAccount, useStreams} from '../features/xyiming-resources';

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
  streamsType,
  period,
  showPeriod = true,
}) {
  const near = useNear();
  const accountSWR = useAccount({near});
  const streamsSWR = useStreams({near, accountSWR});

  const allStreams = streamsSWR.data;

  let streams = [];
  if (streamsType === 'inputs') {
    streams = allStreams ? allStreams.inputs : [];
  } else if (streamsType === 'outputs') {
    streams = allStreams ? allStreams.outputs : [];
  }

  console.log('STREAMS TYPE', streamsType);
  console.log('ALL STREAMS', allStreams);
  console.log('STREAMS', streams);

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
  const selectedPeriod = periodsOptions.option;

  return (
    <div>
      <h2 className="twind-text-xl twind-mb-6 twind-flex twind-items-center">
        <span className="twind-mr-3">{icon}</span>
        {header}
        <span className="twind-ml-2">
          {showPeriod ? (
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
          ) : (
            ''
          )}
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
            showPeriod={showPeriod}
          />
        ))}
      </div>
    </div>
  );
}
