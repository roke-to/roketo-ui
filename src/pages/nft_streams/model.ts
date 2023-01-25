import * as Yup from 'yup';
import {
  ableToAddFunds,
  ableToPauseStream,
  ableToStartStream,
  calculateCliffEndTimestamp,
  calculateCliffPercent,
  calculateTimeLeft,
  formatTimeLeft,
  getStreamDirection,
  getStreamProgress,
  isActiveStream,
  parseColor,
  parseComment,
} from '@roketo/sdk';
import type {RoketoStream} from '@roketo/sdk/dist/types';
import {isPast} from 'date-fns';
import {combine, createEffect, createEvent, createStore, sample} from 'effector';
import {generatePath} from 'react-router-dom';

import {colorDescriptions, NftFormValues} from '~/features/create-stream/constants';
import {getTokensPerSecondCount} from '~/features/create-stream/lib';

import {$isSmallScreen} from '~/entities/screen';
import {
  $accountId,
  $accountNftStreams,
  $accountStreams,
  $nearWallet,
  $priceOracle,
  $roketoWallet,
  $tokens,
} from '~/entities/wallet';

import {STREAM_STATUS} from '~/shared/api/roketo/constants';
import {
  formatSmartly,
  toHumanReadableValue,
  tokensPerMeaningfulPeriod,
  toYocto,
} from '~/shared/api/token-formatter';
import {env} from '~/shared/config';
import {areArraysDifferent, areObjectsDifferent, recordUpdater} from '~/shared/lib/changeDetection';
import {
  DirectionFilter,
  FilterFn,
  getDirectionFilter,
  getStatusFilter,
  getTextFilter,
  StatusFilter,
  StreamSort,
} from '~/shared/lib/getFilters';
import {isWNearTokenId} from '~/shared/lib/isWNearTokenId';
import {getRoundedPercentageRatio} from '~/shared/lib/math';
import {createProtectedEffect} from '~/shared/lib/protectedEffect';
import {ROUTES_MAP} from '~/shared/lib/routing';
import {createStreamToNFT} from '~/shared/lib/vaultContract';

import {sorts, statusOptions} from './constants';
import {collectTotalFinancialAmountInfo, countTotalUSDWithdrawal} from './lib';
import type {StreamCardData, StreamProgressData} from './types';

export const withdrawFormValidationSchema = Yup.object().shape({
  nftContractId: Yup.string().required('NFT Contract is required'),
  nftId: Yup.string().required('NFT ID is required'),
  fungibleToken: Yup.string().required('Fungible Token ID is required'),
});

export const $streamListData = createStore(
  {
    streamsLoading: true,
    hasStreams: false,
  },
  {updateFilter: areObjectsDifferent},
);

export const $allStreams = $accountStreams.map(({inputs, outputs}) => [...inputs, ...outputs]);
export const $allNFTStreams = $accountNftStreams.map(({outputs}) => [...outputs]);

export const $filteredStreams = createStore<RoketoStream[]>([], {updateFilter: areArraysDifferent});

export const $streamFilter = createStore({
  direction: 'All' as DirectionFilter,
  status: 'All' as StatusFilter,
  text: '',
});

export const changeDirectionFilter = createEvent<DirectionFilter>();
export const changeStatusFilter = createEvent<StatusFilter>();
export const changeTextFilter = createEvent<string>();

export const $statusFilterCounts = createStore<Record<StatusFilter, number>>({
  All: 0,
  Initialized: 0,
  Active: 0,
  Paused: 0,
});

export const changeStreamSort = createEvent<StreamSort>();
export const $streamSort = createStore<StreamSort>(sorts.mostRecent);

export const handleCreateStreamToNFTFx = createProtectedEffect({
  source: combine($roketoWallet, $nearWallet, (roketo, near) =>
    !!roketo && !!near ? {roketo, near} : null,
  ),
  async fn(
    {roketo: {tokens, transactionMediator, accountId}, near: {auth}},
    values: NftFormValues,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const {
      receiver,
      isNotDelayed,
      comment,
      deposit,
      duration,
      token,
      isUnlocked,
      cliffDateTime,
      color,
      nftContractId,
      nftId,
    } = values;
    const {roketoMeta, tokenContract, meta} = tokens[token];
    const tokensPerSec = getTokensPerSecondCount(meta, deposit, duration);
    const creator = () =>
      createStreamToNFT({
        deposit: toYocto(meta.decimals, deposit),
        comment,
        receiverId: receiver,
        tokenAccountId: token,
        commissionOnCreate: roketoMeta.commission_on_create,
        tokensPerSec,
        delayed: !isNotDelayed,
        nftContractId,
        nftId,
        isLocked: !isUnlocked,
        cliffPeriodSec: cliffDateTime
          ? Math.floor((cliffDateTime.getTime() - Date.now()) / 1000)
          : undefined,
        color: color === 'none' ? null : colorDescriptions[color].color,
        transactionMediator,
        accountId,
        tokenContract,
        wNearId: env.WNEAR_ID,
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

const progressRedrawTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 1000);
    }),
);

export const $streamCardsData = createStore<Record<string, StreamCardData>>({});

export const $streamsProgress = createStore<Record<string, StreamProgressData>>({});

export const selectStream = createEvent<string | null>();
export const $selectedStream = createStore<string | null>(null);

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

sample({
  source: $accountStreams,
  target: $streamListData,
  fn: ({streamsLoaded, inputs, outputs}) => ({
    streamsLoading: !streamsLoaded,
    hasStreams: inputs.length + outputs.length > 0,
  }),
});

sample({
  source: {streams: $allStreams, filter: $streamFilter, accountId: $accountId, sort: $streamSort},
  target: $filteredStreams,
  fn({streams, filter: {direction, status, text}, accountId, sort}) {
    const filters = [
      getDirectionFilter(accountId, direction),
      getStatusFilter(status),
      getTextFilter(accountId, text),
    ].filter((fn): fn is FilterFn => !!fn);

    const result =
      filters.length === 0
        ? [...streams]
        : streams.filter((item) => filters.every((filter) => filter(item)));
    return result.sort(sort.fn);
  },
});

sample({
  source: {streams: $allStreams, filter: $streamFilter, accountId: $accountId},
  target: $statusFilterCounts,
  fn({streams, filter, accountId}) {
    const directionFilter = getDirectionFilter(accountId, filter.direction);
    const filteredStreams = directionFilter ? streams.filter(directionFilter) : streams;
    return Object.fromEntries(
      statusOptions.map((status) => {
        const statusFilter = getStatusFilter(status);
        const resultStreams = statusFilter ? filteredStreams.filter(statusFilter) : filteredStreams;
        return [status, resultStreams.length];
      }),
    ) as Record<StatusFilter, number>;
  },
});

sample({clock: changeStreamSort, target: $streamSort});

/** redraw progress bar each second */
sample({
  clock: [$filteredStreams, progressRedrawTimerFx.doneData],
  filter: progressRedrawTimerFx.pending.map((pending) => !pending),
  target: [progressRedrawTimerFx],
});

/**
 * when filtered streams or tokens are changed or redraw timer ends,
 * send actual data to retrigger event
 * */
sample({
  clock: [$filteredStreams, $tokens, progressRedrawTimerFx.doneData],
  source: {
    oldData: $streamsProgress,
    accountId: $accountId,
    tokens: $tokens,
    streams: $filteredStreams,
  },
  target: $streamsProgress,
  fn: ({oldData, accountId, streams, tokens}) =>
    recordUpdater(oldData, streams, (stream) => {
      const {token_account_id: tokenId, tokens_per_sec: tokensPerSec} = stream;
      const token = tokens[tokenId];
      if (!token) return undefined;
      const {decimals} = token.meta;
      const symbol = isWNearTokenId(tokenId) ? 'NEAR' : token.meta.symbol;
      const cliffEndTimestamp = calculateCliffEndTimestamp(stream);
      const progress = getStreamProgress({stream});
      const timeLeft = calculateTimeLeft(stream);
      const streamed = Number(toHumanReadableValue(decimals, progress.streamed, 3));
      const withdrawn = Number(toHumanReadableValue(decimals, progress.withdrawn, 3));
      const total = Number(toHumanReadableValue(decimals, progress.full, 3));

      const streamedText = formatSmartly(streamed);
      const withdrawnText = formatSmartly(withdrawn);

      const streamedPercentage = getRoundedPercentageRatio(progress.streamed, progress.full, 1);
      const withdrawnPercentage = getRoundedPercentageRatio(
        progress.withdrawn,
        progress.streamed,
        1,
      );

      const {formattedValue: speedFormattedValue, unit: speedUnit} = tokensPerMeaningfulPeriod(
        decimals,
        tokensPerSec,
      );
      const direction = getStreamDirection(stream, accountId);
      let sign: string;
      switch (direction) {
        case 'IN':
          sign = '+';
          break;
        case 'OUT':
          sign = '-';
          break;
        case null:
        default:
          sign = '';
          break;
      }
      return {
        symbol,
        progressFull: progress.full,
        progressStreamed: progress.streamed,
        progressWithdrawn: progress.withdrawn,
        cliffPercent: calculateCliffPercent(stream),
        cliffText:
          cliffEndTimestamp && !isPast(cliffEndTimestamp)
            ? formatTimeLeft(cliffEndTimestamp - Date.now())
            : null,
        speedFormattedValue,
        speedUnit,
        timeLeft,
        streamedText,
        totalText: total.toString(),
        streamedPercentage,
        withdrawnText,
        withdrawnPercentage,
        direction: direction ? (direction.toLowerCase() as 'in' | 'out') : null,
        sign,
        name: direction === 'IN' ? stream.owner_id : stream.receiver_id,
      };
    }),
});

sample({
  clock: $filteredStreams,
  source: {accountId: $accountId, oldData: $streamCardsData},
  fn: ({accountId, oldData}, streams) =>
    recordUpdater(oldData, streams, (stream, id) => {
      const direction = getStreamDirection(stream, accountId);
      const isIncomingStream = direction === 'IN';
      const iconType: keyof typeof STREAM_STATUS =
        typeof stream.status === 'string' ? stream.status : 'Finished';
      return {
        streamPageLink: generatePath(ROUTES_MAP.stream.path, {id}),
        comment: parseComment(stream.description),
        color: parseColor(stream.description),
        name: isIncomingStream ? stream.owner_id : stream.receiver_id,
        isLocked: stream.is_locked,
        showAddFundsButton: ableToAddFunds(stream, accountId),
        showWithdrawButton: direction === 'IN' && isActiveStream(stream),
        showStartButton: ableToStartStream(stream, accountId),
        showPauseButton: ableToPauseStream(stream, accountId),
        iconType,
      };
    }),
  target: $streamCardsData,
});

sample({
  clock: selectStream,
  source: $selectedStream,
  filter: $isSmallScreen,
  fn: (currentSelection, upd) => (upd === currentSelection ? null : upd),
  target: $selectedStream,
});

sample({
  clock: $isSmallScreen,
  filter: (isSmallScreen) => !isSmallScreen,
  fn: () => null,
  target: $selectedStream,
});

$streamFilter.on(changeDirectionFilter, (filter, direction) => ({...filter, direction}));
$streamFilter.on(changeStatusFilter, (filter, status) => ({...filter, status}));
$streamFilter.on(changeTextFilter, (filter, text) => ({...filter, text}));
