import cn from 'classnames';
import React from 'react';
import ReactModal from 'react-modal';

import {useMediaQuery} from '~/shared/hooks/useMatchQuery';

import styles from './styles.module.scss';

type Props = {
  isOpen: boolean;
  children?: React.ReactNode;

  title?: string;
  onCloseModal?: () => void;
};

// eslint-disable-next-line react/prefer-stateless-function
export const Modal = (props: Props) => {
  const {title, children, isOpen = true, onCloseModal} = props;
  const compact = useMediaQuery('(max-width: 767px)');

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onCloseModal}
      className={styles.content}
      overlayClassName={styles.overlay}
      bodyOpenClassName={styles.bodyOverflowHidden}
    >
      <div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <span
          className={cn(styles.close, compact ? styles.closeMobile : '')}
          onClick={onCloseModal}
        />

        <h2 className={styles.title}>{title}</h2>

        <div className={styles.contentContainer}>{children}</div>
      </div>
    </ReactModal>
  );
};
