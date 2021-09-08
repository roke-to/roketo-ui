import React from 'react';
import classNames from 'classnames';
import {Link} from 'react-router-dom';
import './Button.scss';

const variants = {
  main: 'main',
  filled: 'filled',
  outlined: 'outlined',
};

const sizes = ['normal', 'big'];

export function Button({
  icon,
  children,
  className,
  link,
  size,
  loading,
  loadingText,
  variant = 'outlined',
  ...rest
}) {
  let variantStyles = '';
  let sizeStyles = '';

  if (variant === variants.main) {
    variantStyles = 'Button--main';

    sizeStyles =
      size === 'normal'
        ? 'twind-px-5 twind-py-4  twind-rounded-2xl twind-font-semibold'
        : size === 'big'
        ? 'twind-px-12 twind-py-6 twind-rounded-3xl twind-font-bold'
        : '';
  } else if (variant === variants.outlined) {
    variantStyles =
      'twind-border-solid twind-border twind-border-blue hover:twind-bg-blue twind-font-semibold twind-rounded-lg';
  } else if (variant === variants.filled) {
    variantStyles =
      'twind-bg-dark hover:twind-bg-hover twind-font-semibold twind-rounded-lg';
  }
  const ButtonComponent = link ? Link : 'button';

  return (
    <ButtonComponent
      disabled={loading}
      className={classNames(
        'twind-inline-flex twind-items-center twind-justify-center twind-p-3  twind-whitespace-nowrap',
        variantStyles,
        sizeStyles,
        'twind-transition-all',
        className,
      )}
      {...rest}
    >
      {loading ? (
        loadingText
      ) : (
        <>
          {icon ? <div className="twind-mr-2">{icon}</div> : null}
          {children}
        </>
      )}
    </ButtonComponent>
  );
}
