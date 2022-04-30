import React from 'react';
import {Link} from 'react-router-dom';
import cn from 'classnames';

import styles from './styles.module.scss';

export enum ButtonType {
  button = 'button',
  submit = 'submit',
}

export enum DisplayMode {
  primary = 'primary',
  simple = 'simple',
  action = 'action',
  invisible = 'invisible',
}

type Props = {
  type?: ButtonType
  displayMode?: DisplayMode,
  disabled?: boolean,
  link?: string,
  className?: string,
  children?: React.ReactNode;
  onClick?: (event: any) => void;
}

export const Button = ({
  type = ButtonType.button,
  displayMode = DisplayMode.action,
  disabled = false,
  link,
  children,
  className,
  onClick
}: Props) => {
  const buttonClassName = cn(
    styles.root,
    {
      [styles.primary]: displayMode === DisplayMode.primary,
      [styles.action]: displayMode === DisplayMode.action,
      [styles.simple]: displayMode === DisplayMode.simple,
    },
    className
  );

  const button = (
    <button
      // eslint-disable-next-line react/button-has-type
      type={type}
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );

  if (link) {
    return (
      <Link to={link}>
        {button}
      </Link>
    );
  }

  return button;
};
