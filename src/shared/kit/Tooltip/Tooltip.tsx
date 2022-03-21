import React from 'react';

import RCTooltip from 'rc-tooltip';
import type { AlignType } from 'rc-trigger/lib/interface';

import './Tooltip.scss';

type TooltipProps = {
  placement?: string;
  children?: React.ReactElement;
  html?: never;
  overlay: React.ReactNode;
  className?: string;
  align?: AlignType;
};

export function Tooltip({
  placement = 'top',
  children,
  html,
  overlay,
  align,
  ...rest
}: TooltipProps) {
  return (
    <RCTooltip
      align={align}
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
