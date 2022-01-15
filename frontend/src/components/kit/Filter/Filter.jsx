import React, {useState} from 'react';
import classNames from 'classnames';
import {RadioButton, DropdownOpener, DropdownMenu, DropdownMenuItem} from '..';

export function FilterOptionWithCounter({count, option}) {
  return (
    <span>
      {option} <span className="text-gray font-normal">{count}</span>
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
