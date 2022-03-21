import React, { useState } from 'react';
import classNames from 'classnames';
import { RadioButton } from '../RadioButton';
import { DropdownOpener } from '../DropdownOpener';
import { DropdownMenu, DropdownMenuItem } from '../DropdownMenu';

type FilterOptionWithCounterProps = {
  count: React.ReactNode;
  option: React.ReactNode;
};

export function FilterOptionWithCounter({ count, option }: FilterOptionWithCounterProps) {
  return (
    <span>
      {option}
      {' '}
      <span className="text-gray font-normal">{count}</span>
    </span>
  );
}

type FilterOption = {
  label: string;
  fn: (a: any, b: any) => number;
};

type FilterProps<T> = {
  label: string;
  options: T[];
  renderOption: (option: T, active: boolean) => React.ReactNode;
  renderActive?: (option: T) => React.ReactNode;
  active: T;
  minimal?: boolean;
  onChange: (option: T) => void;
  className: string;
};

export function Filter<T extends string | FilterOption>({
  label,
  options,
  renderOption,
  renderActive,
  active,
  minimal,
  onChange,
  className,
}: FilterProps<T>) {
  const [opened, setOpened] = useState(false);

  return (
    <div className={classNames('inline-flex items-center relative', className)}>
      <div className="text-gray mr-2">{label}</div>
      <DropdownOpener minimal={minimal} rounded onChange={setOpened}>
        {renderActive ? renderActive(active) : active}
      </DropdownOpener>

      <DropdownMenu
        opened={opened}
        className="right-0"
        onClose={() => {
          setOpened(false);
        }}
      >
        {options.map((option) => (
          <DropdownMenuItem key={typeof option === 'string' ? option : option.label}>
            <RadioButton
              label={
                renderOption ? renderOption(option, active === option) : option
              }
              active={active === option}
              value={option}
              onChange={onChange}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
    </div>
  );
}
