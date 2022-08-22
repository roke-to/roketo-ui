import copy from 'clipboard-copy';
import RCTooltip from 'rc-tooltip';
import React, {useState} from 'react';

import {LinkIcon} from '@ui/icons/Link';

import styles from './styles.module.scss';

export const CopyLinkButton = ({className, link}: {className?: string; link: string}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = () => {
    setIsVisible(true);

    copy(link);

    setTimeout(() => {
      setIsVisible(false);
    }, 1500);
  };

  return (
    <RCTooltip
      overlayClassName={styles.overlay}
      destroyTooltipOnHide
      placement="top"
      trigger="click"
      overlay="Link copied to clipboard"
      visible={isVisible}
    >
      <button className={className} type="button" onClick={handleClick}>
        <LinkIcon />
      </button>
    </RCTooltip>
  );
};
