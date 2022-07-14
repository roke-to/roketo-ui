import classNames from 'classnames';
import React from 'react';
import ReactModal from 'react-modal';

import styles from './styles.module.scss';

type Props = {
  isOpen: boolean;
  children?: React.ReactNode;

  title?: React.ReactNode;
  onCloseModal?: () => void;
  className?: string;
};

const renderOverlay = (props: React.ComponentPropsWithRef<'div'>, children: React.ReactElement) => (
  <div {...props}>
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/control-has-associated-label */}
    <span className={styles.close} tabIndex={0} role="button" />
    {children}
  </div>
);

export const Modal = ({title, children, isOpen = true, onCloseModal, className}: Props) => (
  <ReactModal
    isOpen={isOpen}
    onRequestClose={onCloseModal}
    overlayElement={renderOverlay}
    className={classNames(styles.content, className)}
    overlayClassName={styles.overlay}
    bodyOpenClassName={styles.bodyWithModal}
  >
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/control-has-associated-label */}
    <span className={styles.close} tabIndex={0} role="button" onClick={onCloseModal} />
    {title && <h2 className={styles.title}>{title}</h2>}
    {children}
  </ReactModal>
);
