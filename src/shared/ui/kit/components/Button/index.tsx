import React from 'react';
import {Link} from 'react-router-dom';

import styles from './styles.module.scss';

export enum ButtonType {
  button = 'button',
  submit = 'submit',
}

type Props = {
  type?: ButtonType

  link?: string,
  linkClassName?: string,
  children?: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({
  type = ButtonType.button,
  link,
  children,
  linkClassName,
  onClick
}: Props) => {

  const button = (
    // eslint-disable-next-line react/button-has-type
    <button type={type} className={styles.root} onClick={onClick}>
      {children}
    </button>
  );

  if (link) {
    return (
      <Link to={link} className={linkClassName}>
        {button}
      </Link>
    );
  }

  return button;
}
