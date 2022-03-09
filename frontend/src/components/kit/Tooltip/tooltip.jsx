import './tooltip.scss';

import RCTooltip from 'rc-tooltip';
import React from 'react';

export function Tooltip({
  placement = 'top', children, html, overlay, ...rest
}) {
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
