import {
  calculateCliffEndTimestamp,
  calculateCliffPercent,
  formatTimeLeft,
  getStreamDirection,
  parseColor,
  parseComment,
} from '@roketo/sdk';
import type {RoketoStream} from '@roketo/sdk/dist/types';
import {isPast} from 'date-fns';
import {combine, createEffect, createEvent, createStore, sample} from 'effector';

import type {NftFormValues} from '~/features/create-stream/constants';

import {$isSmallScreen} from '~/entities/screen';
import {$accountId, $nearWallet, $roketoWallet, $streamsToNft, $tokens} from '~/entities/wallet';

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
  getTextFilter,
  StatusFilter,
  StreamSort,
} from '~/shared/lib/getFilters';
import {isWNearTokenId} from '~/shared/lib/isWNearTokenId';
import {getRoundedPercentageRatio} from '~/shared/lib/math';
import {createProtectedEffect} from '~/shared/lib/protectedEffect';
import {parseNftContract, vaultTransfer} from '~/shared/lib/vaultContract';

import {linkToExplorer, sorts} from './constants';
import type {StreamCardData, StreamProgressData} from './types';

export const $streamListData = createStore(
  {
    streamsLoading: true,
    hasStreams: false,
  },
  {updateFilter: areObjectsDifferent},
);

export const $filteredStreams = createStore<RoketoStream[]>([], {updateFilter: areArraysDifferent});

export const $streamFilter = createStore({
  direction: 'All' as DirectionFilter,
  status: 'All' as StatusFilter,
  text: '',
});

export const changeDirectionFilter = createEvent<DirectionFilter>();
export const changeTextFilter = createEvent<string>();

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
    const {deposit, nftId, nftContractId, token} = values;

    const {tokenContract, meta} = tokens[token];

    const creator = () =>
      vaultTransfer({
        owner_id: accountId,
        amount: toYocto(meta.decimals, deposit),
        transactionMediator,
        tokenContract,
        tokenAccountId: token,
        nftId,
        nftContractId,
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
  source: $streamsToNft,
  fn: ({streamsLoaded, streams}) => ({
    streamsLoading: !streamsLoaded,
    hasStreams: streams.length > 0,
  }),
  target: $streamListData,
});

sample({
  source: {streams: $streamsToNft, filter: $streamFilter, accountId: $accountId, sort: $streamSort},
  target: $filteredStreams,
  fn({streams: {streams}, filter: {direction, text}, accountId, sort}) {
    const filters = [
      getDirectionFilter(accountId, direction),
      getTextFilter(accountId, text),
    ].filter((fn): fn is FilterFn => !!fn);

    const result =
      filters.length === 0
        ? [...streams]
        : streams.filter((item) => filters.every((filter) => filter(item)));
    return result.sort(sort.fn);
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

      const progress = {
        full: Number(stream.balance).toFixed(0),
        withdrawn: '0',
        streamed: Number(stream.balance).toFixed(0),
        left: 0,
        available: 0,
      };
      const timeLeft = '0';

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
        sign: '',
        name: direction === 'IN' ? stream.owner_id : stream.receiver_id,
      };
    }),
});

sample({
  clock: $filteredStreams,
  source: {accountId: $accountId, oldData: $streamCardsData},
  fn: ({accountId, oldData}, streams) =>
    recordUpdater(oldData, streams, (stream) => {
      const direction = getStreamDirection(stream, accountId);
      const isIncomingStream = direction === 'IN';
      const iconType: keyof typeof STREAM_STATUS = 'Finished';
      const nftDetails = parseNftContract(stream.description);

      return {
        streamPageLink: `${linkToExplorer}${stream.id}`,
        comment: parseComment(stream.description),
        color: parseColor(stream.description),
        name: isIncomingStream ? stream.owner_id : stream.receiver_id,
        isLocked: stream.is_locked,
        showAddFundsButton: false,
        showWithdrawButton: direction === 'IN',
        showStartButton: false,
        showPauseButton: false,
        showStopButton: false,
        iconType,
        nftId: nftDetails.nftId || '',
        nftContract: nftDetails.nftContractId || '',
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
$streamFilter.on(changeTextFilter, (filter, text) => ({...filter, text}));
