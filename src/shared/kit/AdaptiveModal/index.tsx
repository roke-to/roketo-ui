import cn from 'classnames';
import type {ReactNode} from 'react';
import Modal from 'react-modal';

import {DropdownMenu} from '~/shared/kit/DropdownMenu';

import styles from './styles.module.scss';

export function AdaptiveModal({
  onClose,
  isOpen,
  dropdownClassName,
  overlayClassName,
  modalClassName,
  compact = false,
  children,
}: {
  onClose(): void;
  isOpen: boolean;
  dropdownClassName?: string;
  overlayClassName?: string;
  modalClassName?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return compact ? (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={cn(styles.modalContent, modalClassName)}
      overlayClassName={cn(styles.modalOverlay, overlayClassName)}
    >
      {children}
    </Modal>
  ) : (
    <DropdownMenu opened={isOpen} onClose={onClose} className={cn(dropdownClassName)}>
      {children}
    </DropdownMenu>
  );
}
