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
  renderActive,
  active,
  minimal,
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
        minimal={minimal}
        rounded
        onClick={() => setOpened(!opened)}
      >
        {renderActive ? renderActive(active) : active}
      </DropdownOpener>

      <DropdownMenu opened={opened} className="twind-right-0">
        {options.map((option, i) => (
          <DropdownMenuItem key={i}>
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
