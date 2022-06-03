import cx from 'classnames';
import React, {useState} from 'react';

import {DropdownMenu} from '../DropdownMenu';
import {DropdownOpener} from '../DropdownOpener';
import {RadioButton} from '../RadioButton';
import styles from './styles.module.scss';

type FilterOptionWithCounterProps = {
  count: React.ReactNode;
  option: React.ReactNode;
};

export function FilterOptionWithCounter({count, option}: FilterOptionWithCounterProps) {
  return (
    <span>
      {option} <span className="text-gray font-normal">{count}</span>
    </span>
  );
}

type FilterOption = {
  label?: string;
  fn: (a: any, b: any) => number;
};

type FilterProps<T> = {
  label: string;
  options: T[];
  renderOption: (option: T, active: boolean) => React.ReactNode;
  renderActive?: (option: T) => React.ReactNode;
  active: T;
  onChange: (option: T) => void;
  className?: string;
  isDisabled?: boolean;
};

export function Filter<T extends string | FilterOption>({
  label,
  options,
  renderOption,
  renderActive,
  active,
  onChange,
  className,
  isDisabled,
}: FilterProps<T>) {
  const [opened, setOpened] = useState(false);

  return (
    <div className={cx(styles.root, className)}>
      {label && <div className="text-gray mr-2">{label}</div>}

      <div className={styles.dropdownWrapper}>
        <DropdownOpener
          className={cx(isDisabled && styles.dropdownInactive, isDisabled && 'text-gray')}
          opened={!isDisabled && opened}
          onChange={setOpened}
        >
          {renderActive ? renderActive(active) : active}
        </DropdownOpener>

        <DropdownMenu
          opened={!isDisabled && opened}
          className={styles.dropdownMenu}
          onClose={() => {
            setOpened(false);
          }}
        >
          {options.map((option) => (
            <RadioButton
              key={JSON.stringify(option)}
              label={renderOption ? renderOption(option, active === option) : option}
              active={active === option}
              value={option}
              onChange={onChange}
            />
          ))}
        </DropdownMenu>
      </div>
    </div>
  );
}
