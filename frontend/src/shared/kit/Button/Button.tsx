import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import './Button.scss';

const variants = {
  main: 'main',
  filled: 'filled',
  outlined: 'outlined',
};

// const sizes = ['normal', 'big'];
// const colors = ['dark', 'light'];

type CommonButtonProps = {
  icon: never;
  children: React.ReactNode;
  className: never;
  size: never;
  loading: never;
  disabled: never;
  loadingText: never;
  color?: string;
  variant?: string;
  type: 'button';
};

type SpecificLinkProps = {
  link: true;
  to: string;
};

type SpecificButtonProps = {
  link?: false;
};

type ButtonProps = CommonButtonProps & (SpecificLinkProps | SpecificButtonProps);

export function Button({
  icon,
  children,
  className,
  size,
  loading,
  disabled,
  loadingText,
  color = 'light',
  variant = 'outlined',
  ...restProps
}: ButtonProps) {
  let variantStyles = '';
  let sizeStyles = '';
  let colorStyles = '';

  if (variant === variants.main) {
    variantStyles = 'Button--main';
    sizeStyles = size === 'normal'
      ? 'px-5 py-4  rounded-2xl font-semibold'
      : size === 'big'
        ? 'px-12 py-6 rounded-3xl font-bold'
        : '';
  } else if (variant === variants.outlined) {
    variantStyles = 'border-solid border font-semibold rounded-lg ';
    colorStyles = color === 'light'
      ? 'border-blue hover:bg-blue'
      : color === 'dark'
        ? 'border-border hover:bg-hover hover:border-hover'
        : '';
  } else if (variant === variants.filled) {
    variantStyles = 'bg-dark hover:bg-hover font-semibold rounded-lg active:bg-transparent';
  }

  const commonProps = {
    disabled: loading || disabled,
    className: classNames(
      'inline-flex items-center justify-center p-3  whitespace-nowrap',
      variantStyles,
      sizeStyles,
      colorStyles,
      disabled ? 'Button--disabled' : '',
      'transition-all',
      className
    ),
  };

  const content = loading ? (
    loadingText
  ) : (
    <>
      {icon ? <div className="mr-2">{icon}</div> : null}
      {children}
    </>
  );

  return restProps.link ? (
    <Link {...commonProps} {...restProps}>{content}</Link>
  ) : (
    <button {...commonProps} {...restProps} type="button">{content}</button>
  );
}
