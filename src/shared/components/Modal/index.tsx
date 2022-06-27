import classNames from 'classnames';
import React from 'react';
import ReactModal from 'react-modal';

import {useMobile} from '~/shared/hooks/useMobile';

import styles from './styles.module.scss';

type Props = {
  isOpen: boolean;
  children?: React.ReactNode;

  title?: React.ReactNode;
  onCloseModal?: () => void;
  className?: string;
};

export const Modal = ({title, children, isOpen = true, onCloseModal, className}: Props) => {
  const isMobile = useMobile();

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onCloseModal}
      className={classNames(styles.content, className)}
      overlayClassName={classNames(styles.overlay, isMobile && styles.mobile)}
      bodyOpenClassName={styles.bodyWithModal}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      {!isMobile && <span className={styles.close} onClick={onCloseModal} />}
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </ReactModal>
  );
};
