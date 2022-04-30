import React from 'react';
import ReactModal from 'react-modal';

import styles from './styles.module.scss';

type Props = {
  isOpen: boolean,
  children?: React.ReactNode,

  title?: string,
  onCloseModal?: () => void,
};

export const Modal = ({isOpen = true, title, children, onCloseModal}: Props) => (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onCloseModal}
      className={styles.content}
      overlayClassName={styles.overlay}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <span className={styles.close} onClick={onCloseModal} />

      <h2 className={styles.title}>{title}</h2>
      {children}
    </ReactModal>
  );
