import React from 'react';

import RCTooltip from 'rc-tooltip';
import type { AlignType } from 'rc-trigger/lib/interface';

import './Tooltip.scss';

type TooltipProps = {
  placement: string;
  children: never;
  html: never;
  overlay: never;
  align: AlignType;
};

export function Tooltip({
  placement = 'top',
  children,
  html,
  overlay,
  align,
}: TooltipProps) {
  return (
    <RCTooltip
      align={align}
      placement={placement}
      overlay={
        html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : overlay
      }
    >
      {children || <span className="Tooltip__defaultIcon">?</span>}
    </RCTooltip>
  );
}
