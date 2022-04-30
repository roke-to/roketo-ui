import React from 'react';
import classNames from 'classnames';
import { useOutsideClick } from 'shared/hooks/useOutsideClick';

import styles from './styles.module.scss';

type DropdownMenuProps = {
  opened: boolean;
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
};

export function DropdownMenu({
  opened,
  children,
  className,
  onClose
}: DropdownMenuProps) {
  const ref = React.useRef<HTMLInputElement | null>(null);

  useOutsideClick(ref, () => {
    if (opened) {
      onClose();
    }
  });

  return (
    <div
      ref={ref}
      className={classNames(
        styles.menu,
        {[styles.hidden]: !opened},
        className,
      )}
    >
      {children}
    </div>
  );
}

type DropdownMenuItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function DropdownMenuItem({ children, className, ...rest }: DropdownMenuItemProps) {
  return (
    <div className={className}{...rest}>
      {children}
    </div>
  );
}

export function DropdownMenuDivider() {
  return <div className={styles.menuDivider} />;
}
