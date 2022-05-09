import React, {Component} from 'react';
import ReactModal from 'react-modal';
// @ts-ignore
import {disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks} from 'body-scroll-lock';

import styles from './styles.module.scss';

type Props = {
  isOpen: boolean,
  children?: React.ReactNode,

  title?: string,
  onCloseModal?: () => void,
};

// eslint-disable-next-line react/prefer-stateless-function
export class Modal extends Component<Props, any> {
  targetRef = React.createRef<HTMLDivElement>();

  targetElement: any = null;

  componentDidMount() {
    // The target element is the one we would like to allow scroll on
    this.targetElement = this.targetRef.current;
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const currentProps = this.props;
    if (currentProps.isOpen !== prevProps.isOpen) {
      this.handlePageScroll();
    }
  }

  componentWillUnmount() {
    clearAllBodyScrollLocks();
  }

  handlePageScroll = () => {
    const {isOpen} = this.props;

    if (isOpen) {
      disableBodyScroll(this.targetElement);
    } else {
      enableBodyScroll(this.targetElement);
    }
  }


  render() {
    const {
      title,
      children,
      isOpen = true,
      onCloseModal,
    } = this.props;


    return (
      <ReactModal
        isOpen={isOpen}
        onRequestClose={onCloseModal}
        className={styles.content}
        overlayClassName={styles.overlay}
      >
        <div ref={this.targetRef}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
          <span className={styles.close} onClick={onCloseModal} />

          <h2 className={styles.title}>{title}</h2>
          {children}
        </div>
      </ReactModal>
    );
  }
}
