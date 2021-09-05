import React from 'react';
import classNames from 'classnames';
import './Button.scss';

const variants = {
  main: 'main',
  outlined: 'outlined',
};
export function Button({
  icon,
  children,
  className,
  variant = 'outlined',
  ...rest
}) {
  let variantStyles = '';
  if (variant === variants.main) {
    variantStyles =
      'twind-px-12 twind-py-6 twind-font-bold Button--main twind-rounded-3xl';
  } else if (variant === variants.outlined) {
    variantStyles =
      'twind-border-solid twind-border twind-border-blue hover:twind-bg-blue twind-font-semibold twind-rounded-lg';
  }

  return (
    <button
      className={classNames(
        'twind-inline-flex twind-items-center twind-justify-center twind-p-3  twind-whitespace-nowrap',
        variantStyles,
        'twind-transition-all',
        className,
      )}
      {...rest}
    >
      {icon ? <div className="twind-mr-2">{icon}</div> : null}
      {children}
    </button>
  );
}
