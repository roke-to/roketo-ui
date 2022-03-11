import './Tooltip.scss';

import RCTooltip from 'rc-tooltip';
import React from 'react';

type TooltipProps = {
  placement?: string;
  children: never;
  html: never;
  overlay: never;
};

export function Tooltip({
  placement = 'top',
  children,
  html,
  overlay,
  ...rest
}: TooltipProps) {
  return (
    <RCTooltip
      // @ts-ignore
      placement={placement}
      overlay={
        html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : overlay
      }
      {...rest}
    >
      {children || <span className="Tooltip__defaultIcon">?</span>}
    </RCTooltip>
  );
}
