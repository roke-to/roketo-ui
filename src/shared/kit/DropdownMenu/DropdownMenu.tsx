import cn from 'classnames';
import React from 'react';

import {useOutsideClick} from '~/shared/hooks/useOutsideClick';

import styles from './styles.module.scss';

type DropdownMenuProps = {
  opened: boolean;
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
};

function DropdownMenuContent({opened, children, className, onClose}: DropdownMenuProps) {
  const ref = React.useRef<HTMLInputElement | null>(null);

  useOutsideClick(ref, () => {
    if (opened) {
      onClose();
    }
  });

  return (
    <div ref={ref} className={cn(styles.menu, className)}>
      {children}
    </div>
  );
}

export function DropdownMenu(props: DropdownMenuProps) {
  // eslint-disable-next-line react/destructuring-assignment
  return props.opened ? <DropdownMenuContent {...props} /> : null;
}

type DropdownMenuItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function DropdownMenuItem({children, className, ...rest}: DropdownMenuItemProps) {
  return (
    <div className={cn(styles.menuItem, className)} {...rest}>
      {children}
    </div>
  );
}

export function DropdownMenuDivider({className}: {className?: string}) {
  return <div className={cn(styles.menuDivider, className)} />;
}
