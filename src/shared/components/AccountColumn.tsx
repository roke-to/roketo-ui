import React, { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuItem,
} from 'shared/kit/DropdownMenu';
import { RadioButton } from 'shared/kit/RadioButton';
import { DropdownOpener } from 'shared/kit/DropdownOpener';
import { useFilter } from 'features/filtering/lib';
import { RoketoAccount } from 'shared/api/roketo/interfaces/entities';

import { AccountStreamCard } from './AccountStreamCard';

const PERIODS = {
  sec: '/sec',
  min: '/min',
  hour: '/hour',
  day: '/day',
};

type AccountColumnProps = {
  account?: RoketoAccount;
  header: string;
  icon: React.ReactNode;
  tokensField: 'total_incoming' | 'total_outgoing' | 'total_received';
  showPeriod?: boolean;
  className?: string;
};

export function AccountColumn({
  account,
  header,
  icon,
  tokensField,
  showPeriod = true,
  className,
}: AccountColumnProps) {
  const tokensData = account !== undefined ? account[tokensField] : {};

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
        {Object.keys(tokensData)
          .filter((tokenAccountId: string) => tokensData[tokenAccountId] !== "0")
          .map((tokenAccountId: string) => (
            <AccountStreamCard
              key={tokenAccountId}
              token={tokenAccountId}
              balance={tokensData[tokenAccountId]}
              streamsLength={0}
              period={selectedPeriod}
              showPeriod={showPeriod}
              className="mb-4"
            />
          )
        )}
      </div>
    </div>
  );
}
