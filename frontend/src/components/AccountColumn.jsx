import classNames from 'classnames';
import React from 'react';
import {StreamIn, StreamOut, StreamWithdraw} from './icons';
import {intervalToDuration, formatDuration} from 'date-fns';
import {TokenFormatter} from '../lib/formatting';

export function AccountColumn({header, icon}) {
  return (
    <div>
      <h2 className="twind-text-xl twind-mb-6 twind-flex twind-items-center">
        <span className="twind-mr-3">{icon}</span>
        {header}
      </h2>
    </div>
  );
}
