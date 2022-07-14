import {combine, createStore, sample} from 'effector';
import {generatePath} from 'react-router-dom';

import {colorDescriptions} from '~/features/create-stream/constants';
import type {FormValues} from '~/features/create-stream/constants';
import {getTokensPerSecondCount} from '~/features/create-stream/lib';

import {
  $accountStreams,
  $nearWallet,
  $priceOracle,
  $roketoWallet,
  $tokens,
} from '~/entities/wallet';

import {createStream} from '~/shared/api/methods';
import {isActiveStream} from '~/shared/api/roketo/lib';
import {toYocto} from '~/shared/api/token-formatter';
import {createProtectedEffect} from '~/shared/lib/protectedEffect';
import {ROUTES_MAP} from '~/shared/lib/routing';

import {collectTotalFinancialAmountInfo, countTotalUSDWithdrawal} from './lib';

const redirectUrl = generatePath(ROUTES_MAP.streams.path);
const returnPath = `${window.location.origin}/#${redirectUrl}`;

export const handleCreateStreamFx = createProtectedEffect({
  source: combine($roketoWallet, $nearWallet, (roketo, near) =>
    !!roketo && !!near ? {roketo, near} : null,
  ),
  async fn({roketo: {tokens, transactionMediator, accountId}, near: {auth}}, values: FormValues) {
    const {receiver, delayed, comment, deposit, duration, token, isLocked, cliffDateTime, color} =
      values;
    const {roketoMeta, tokenContract, meta} = tokens[token];
    const tokensPerSec = getTokensPerSecondCount(meta, deposit, duration);
    const creator = () =>
      createStream({
        deposit: toYocto(meta.decimals, deposit),
        comment,
        receiverId: receiver,
        tokenAccountId: token,
        commissionOnCreate: roketoMeta.commission_on_create,
        tokensPerSec,
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

export const $financialStatus = createStore({
  outcomeAmountInfo: {
    total: 0,
    streamed: 0,
    withdrawn: 0,
  },
  incomeAmountInfo: {
    total: 0,
    streamed: 0,
    withdrawn: 0,
  },
  availableForWithdrawal: 0,
});

sample({
  source: {
    tokens: $tokens,
    streams: $accountStreams,
    priceOracle: $priceOracle,
  },
  fn({tokens, streams: {inputs, outputs}, priceOracle}) {
    const activeInputStreams = inputs.filter(isActiveStream);
    const activeOutputStreams = outputs.filter(isActiveStream);
    return {
      outcomeAmountInfo: collectTotalFinancialAmountInfo(activeOutputStreams, tokens, priceOracle),
      incomeAmountInfo: collectTotalFinancialAmountInfo(activeInputStreams, tokens, priceOracle),
      availableForWithdrawal: countTotalUSDWithdrawal(activeInputStreams, tokens, priceOracle),
    };
  },
  target: $financialStatus,
});
