import React, { useState } from 'react';

import { useRoketoContext } from 'app/roketo-context';
import {
  DropdownMenu,
  DropdownMenuItem,
} from 'shared/kit/DropdownMenu';
import { RadioButton } from 'shared/kit/RadioButton';
import { DropdownOpener } from 'shared/kit/DropdownOpener';
import { useFilter } from 'features/filtering/lib';
import { useAccount, useStreams } from 'features/xyiming-resources';
import { AccountStreamCard } from './AccountStreamCard';

const PERIODS = {
  sec: '/sec',
  min: '/min',
  hour: '/hour',
  day: '/day',
};

type AccountColumnProps = {
  account: any;
  header: string;
  icon: React.ReactNode;
  tokensField: string;
  streamsType?: string;
  showPeriod?: boolean;
  className?: string;
};

export function AccountColumn({
  account,
  header,
  icon,
  tokensField,
  streamsType,
  showPeriod = true,
  className,
}: AccountColumnProps) {
  const { auth, roketo } = useRoketoContext();
  const accountSWR = useAccount({ auth, roketo });
  const streamsSWR = useStreams({ auth, roketo, accountSWR });

  const allStreams = streamsSWR.data;

  let streams = [];
  if (streamsType === 'inputs') {
    streams = allStreams ? allStreams.inputs : [];
  } else if (streamsType === 'outputs') {
    streams = allStreams ? allStreams.outputs : [];
  }

  let streamGroups = {} as any;
  if (streams !== undefined) {
    streamGroups = streams.reduce((groups: any, item: any) => {
      const group = groups[item.ticker] || [];
      group.push(item);
      groups[item.ticker] = group; // eslint-disable-line no-param-reassign
      return groups;
    }, {});
  }

  const tokensData = account !== undefined ? account[tokensField] : [];

  const periodsOptions = useFilter({ options: PERIODS });
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
              <DropdownOpener minimal rounded onChange={setOpened}>
                {periodsOptions.options[selectedPeriod]}
              </DropdownOpener>
              <DropdownMenu
                opened={opened}
                className="right-0"
                onClose={() => setOpened(false)}
              >
                {periodsOptions.optionsArray.map((option) => (
                  <DropdownMenuItem key={option}>
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
        {tokensData.map((item: any) => (
          <AccountStreamCard
            key={item[0]}
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
