import React from 'react';
import RCTooltip from 'rc-tooltip';
import type { TooltipProps as RCTooltipProps } from 'rc-tooltip/lib/Tooltip';
import 'rc-tooltip/assets/bootstrap_white.css';

import styles from './styles.module.scss';

type TooltipProps = {
  placement?: RCTooltipProps["placement"];
  children?: React.ReactElement;
  overlay: RCTooltipProps["overlay"];
  align?: RCTooltipProps["align"];
  overlayClassName?: RCTooltipProps["overlayClassName"];
};

export function Tooltip({
  placement = 'top',
  children,
  overlay,
  align,
  overlayClassName
}: TooltipProps) {
  return (
    <RCTooltip
      align={align}
      placement={placement}
      overlay={overlay}
      overlayClassName={overlayClassName || styles.defaultOverlay}
    >
      {children || <span className={styles.defaultIcon}>?</span>}
    </RCTooltip>
  );
}
