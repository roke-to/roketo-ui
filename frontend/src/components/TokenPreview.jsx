import classNames from 'classnames';
import React from 'react';
import {StreamIn, StreamOut, StreamWithdraw} from './icons';
import {intervalToDuration, formatDuration} from 'date-fns';
import {TokenFormatter} from '../lib/formatting';
import {StreamCard} from '../components/StreamCard';
import useSWR from 'swr';
import {useNear} from '../features/near-connect/useNear';

export function TokenPreview({token, streams}) {
  return <div>asd: {token}</div>;
}
