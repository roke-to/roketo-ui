import {attach} from 'effector';
import {generatePath} from 'react-router-dom';

import {colorDescriptions} from '~/features/create-stream/constants';
import type {FormValues} from '~/features/create-stream/constants';
import {getTokensPerSecondCount} from '~/features/create-stream/lib';

import {$roketoWallet} from '~/entities/wallet';

import {toYocto} from '~/shared/api/ft/token-formatter';
import {ROUTES_MAP} from '~/shared/lib/routing';

const redirectUrl = generatePath(ROUTES_MAP.streams.path);
const returnPath = `${window.location.origin}/#${redirectUrl}`;

export const handleCreateStreamFx = attach({
  source: $roketoWallet,
  async effect(wallet, values: FormValues) {
    if (!wallet) throw Error('no roketo wallet exists');
    const {roketo, tokens} = wallet;
    const {receiver, delayed, comment, deposit, duration, token, isLocked, cliffDateTime, color} =
      values;

    const {api, roketoMeta, meta} = tokens[token];
    const tokensPerSec = getTokensPerSecondCount(meta, deposit, duration);

    const ftTransferParams = roketo.api.createFTTransferParams({
      deposit: toYocto(meta.decimals, deposit),
      comment,
      receiverId: receiver,
      tokenAccountId: token,
      commissionOnCreate: roketoMeta.commission_on_create,
      tokensPerSec,
      delayed,
      isLocked,
      cliffPeriodSec: cliffDateTime
        ? Math.floor((cliffDateTime.getTime() - Date.now()) / 1000)
        : undefined,
      color: color === 'none' ? null : colorDescriptions[color].color,
    });

    await api.transferMany([ftTransferParams], returnPath);
  },
});
