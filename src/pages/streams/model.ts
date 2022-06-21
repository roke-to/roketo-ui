import {generatePath} from 'react-router-dom';

import {colorDescriptions} from '~/features/create-stream/constants';
import type {FormValues} from '~/features/create-stream/constants';

import {$roketoWallet} from '~/entities/wallet';

import {toYocto} from '~/shared/api/ft/token-formatter';
import {createProtectedEffect} from '~/shared/lib/protectedEffect';
import {ROUTES_MAP} from '~/shared/lib/routing';

const redirectUrl = generatePath(ROUTES_MAP.streams.path);
const returnPath = `${window.location.origin}/#${redirectUrl}`;

export const handleCreateStreamFx = createProtectedEffect({
  source: $roketoWallet,
  async fn({tokens, roketo}, values: FormValues) {
    const {receiver, delayed, comment, deposit, speed, token, isLocked, cliffDateTime, color} =
      values;

    const {api, roketoMeta, meta} = tokens[token];

    await roketo.api.createStream({
      deposit: toYocto(meta.decimals, deposit),
      comment,
      receiverId: receiver,
      tokenAccountId: token,
      commissionOnCreate: roketoMeta.commission_on_create,
      tokensPerSec: speed,
      delayed,
      callbackUrl: returnPath,
      handleTransferStream: api.transfer,
      isLocked,
      cliffPeriodSec: cliffDateTime
        ? Math.floor((cliffDateTime.getTime() - Date.now()) / 1000)
        : undefined,
      color: color === 'none' ? null : colorDescriptions[color].color,
    });
  },
});
