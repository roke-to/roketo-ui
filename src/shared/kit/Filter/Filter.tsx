import React, {useState} from 'react';
import classNames from 'classnames';
import {RadioButton} from '../RadioButton';
import {DropdownOpener} from '../DropdownOpener';
import {DropdownMenu} from '../DropdownMenu';

import styles from './styles.module.scss';

type FilterOptionWithCounterProps = {
  count: React.ReactNode;
  option: React.ReactNode;
};

export function FilterOptionWithCounter({count, option}: FilterOptionWithCounterProps) {
  return (
    <span>
      {option}
      {' '}
      <span className="text-gray font-normal">{count}</span>
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
};

export function Filter<T extends string | FilterOption>({
  label,
  options,
  renderOption,
  renderActive,
  active,
  onChange,
  className,
}: FilterProps<T>) {
  const [opened, setOpened] = useState(false);

  return (
    <div className={classNames(styles.root, className)}>
      {label &&
        <div className="text-gray mr-2">{label}</div>
      }

      <div className={styles.dropdownWrapper}>
        <DropdownOpener opened={opened} onChange={setOpened}>
          {renderActive ? renderActive(active) : active}
        </DropdownOpener>

        <DropdownMenu
          opened={opened}
          className={styles.dropdownMenu}
          onClose={() => {
            setOpened(false);
          }}
        >
          {options.map((option) => (
            <RadioButton
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
