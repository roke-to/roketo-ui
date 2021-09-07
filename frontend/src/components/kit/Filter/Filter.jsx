import React, {useState} from 'react';
import {DropdownArrowDown} from '../../icons/DropdownArrowDown';
import classNames from 'classnames';
import {RadioButton, DropdownOpener, DropdownMenu, DropdownMenuItem} from '..';

export function FilterOptionWithCounter({count, option}) {
  return (
    <span>
      {option}{' '}
      <span className="twind-text-gray twind-font-normal">{count}</span>
    </span>
  );
}

export function Filter({
  label,
  options,
  renderOption,
  active,
  onChange,
  className,
}) {
  const [opened, setOpened] = useState(false);

  return (
    <div
      className={classNames(
        'twind-inline-flex twind-items-center twind-relative',
        className,
      )}
    >
      <div className="twind-text-gray twind-mr-2">{label}</div>
      <DropdownOpener
        rounded
        onClick={() => setOpened(!opened)}
        className="twind-w-36"
      >
        {active}
      </DropdownOpener>

      <DropdownMenu opened={opened}>
        {options.map((option) => (
          <DropdownMenuItem>
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
