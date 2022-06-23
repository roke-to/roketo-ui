import {combine} from 'effector';
import {generatePath} from 'react-router-dom';

import {colorDescriptions} from '~/features/create-stream/constants';
import type {FormValues} from '~/features/create-stream/constants';

import {$nearWallet, $roketoWallet} from '~/entities/wallet';

import {createStream} from '~/shared/api/methods';
import {toYocto} from '~/shared/api/token-formatter';
import {createProtectedEffect} from '~/shared/lib/protectedEffect';
import {ROUTES_MAP} from '~/shared/lib/routing';

const redirectUrl = generatePath(ROUTES_MAP.streams.path);
const returnPath = `${window.location.origin}/#${redirectUrl}`;

export const handleCreateStreamFx = createProtectedEffect({
  source: combine($roketoWallet, $nearWallet, (roketo, near) =>
    !!roketo && !!near ? {roketo, near} : null,
  ),
  async fn({roketo: {tokens, transactionMediator, accountId}, near: {auth}}, values: FormValues) {
    const {receiver, delayed, comment, deposit, speed, token, isLocked, cliffDateTime, color} =
      values;
    const {roketoMeta, tokenContract, meta} = tokens[token];
    const creator = () =>
      createStream({
        deposit: toYocto(meta.decimals, deposit),
        comment,
        receiverId: receiver,
        tokenAccountId: token,
        commissionOnCreate: roketoMeta.commission_on_create,
        tokensPerSec: speed,
        delayed,
        callbackUrl: returnPath,
        isLocked,
        cliffPeriodSec: cliffDateTime
          ? Math.floor((cliffDateTime.getTime() - Date.now()) / 1000)
          : undefined,
        color: color === 'none' ? null : colorDescriptions[color].color,
        transactionMediator,
        accountId,
        tokenContract,
      });
    try {
      await creator();
    } catch (error) {
      if ((error as Error).message === 'Wallet not signed in') {
        await auth.login();
        await creator();
      } else {
        throw error;
      }
    }
  },
});
