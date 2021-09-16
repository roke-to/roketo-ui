import './tooltip.scss';

import RCTooltip from 'rc-tooltip';
import React from 'react';

export function Tooltip({children, html, overlay, ...rest}) {
  return (
    <RCTooltip
      // @ts-ignore
      placement="top"
      overlay={
        html ? <div dangerouslySetInnerHTML={{__html: html}}></div> : overlay
      }
      {...rest}
    >
      {children || <span className="Tooltip__defaultIcon">?</span>}
    </RCTooltip>
  );
}
