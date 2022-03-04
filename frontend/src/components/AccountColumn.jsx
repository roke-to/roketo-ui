import React, {useState} from 'react';
import {AccountStreamCard} from './AccountStreamCard';
import {useNear} from '../features/near-connect';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownOpener,
  RadioButton,
} from './kit';
import {useFilter} from '../features/filtering/lib';
import {useAccount, useStreams} from '../features/xyiming-resources';

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
  showPeriod = true,
  className,
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

  let streamGroups = {};
  if (streams !== undefined) {
    streamGroups = streams.reduce((groups, item) => {
      const group = groups[item.ticker] || [];
      group.push(item);
      groups[item.ticker] = group;
      return groups;
    }, {});
  }

  const tokensData = account !== undefined ? account[tokensField] : [];

  const periodsOptions = useFilter({options: PERIODS});
  const [opened, setOpened] = useState(false);
  const selectedPeriod = periodsOptions.option;

  return (
    <div className={className}>
      <h2 className="text-xl mb-6 flex items-center">
        <span className="mr-3">{icon}</span>
        {header}
        <span className="ml-2">
          {showPeriod ? (
            <div className="inline-flex items-center relative">
              <DropdownOpener minimal={true} rounded onChange={setOpened}>
                {periodsOptions.options[selectedPeriod]}
              </DropdownOpener>
              <DropdownMenu
                opened={opened}
                className="right-0"
                onClose={() => setOpened(false)}
              >
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
            className="mb-4"
          />
        ))}
      </div>
    </div>
  );
}
