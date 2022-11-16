import {getStreamProgress} from '@roketo/sdk';
import {format} from 'date-fns';
import {createEffect, createEvent, createStore, sample} from 'effector';

// import {generatePath} from 'react-router-dom';
import {$isSmallScreen} from '~/entities/screen';
import {$accountId, $subscriptions, $tokens} from '~/entities/wallet';

import {ApplicationResponseDto} from '~/shared/api/rb';
import {STREAM_STATUS} from '~/shared/api/roketo/constants';
import {formatSmartly, toHumanReadableValue} from '~/shared/api/token-formatter';
import {areArraysDifferent, areObjectsDifferent, recordUpdater} from '~/shared/lib/changeDetection';
// import {ROUTES_MAP} from '~/shared/lib/routing';
import {isWNearTokenId} from '~/shared/lib/isWNearTokenId';
import {getRoundedPercentageRatio} from '~/shared/lib/math';

import {sorts, statusOptions} from './constants';
import {
  calculateFinalDate,
  calculateTimeLeft,
  FilterFn,
  getStatusFilter,
  getTextFilter,
  StatusFilter,
  SubscriptionSort,
} from './lib';
import type {SubscriptionCardData, SubscriptionProgressData} from './types';

export const $subscriptionListData = createStore(
  {
    subscriptionsLoading: true,
    hasSubscriptions: false,
  },
  {updateFilter: areObjectsDifferent},
);

export const $filteredSubscriptions = createStore<ApplicationResponseDto[]>([], {
  updateFilter: areArraysDifferent,
});

export const $subscriptionFilter = createStore({
  // direction: 'All' as DirectionFilter,
  status: 'All' as StatusFilter,
  text: '',
});

// export const changeDirectionFilter = createEvent<DirectionFilter>();
export const changeStatusFilter = createEvent<StatusFilter>();
export const changeTextFilter = createEvent<string>();

export const $statusFilterCounts = createStore<Record<StatusFilter, number>>({
  All: 0,
  Active: 0,
  Paused: 0,
  Stopped: 0,
  Finished: 0,
});

export const changeSubscriptionSort = createEvent<SubscriptionSort>();
export const $subscriptionSort = createStore<SubscriptionSort>(sorts.bigBalanceFirst);

export const $financialStatus = createStore({
  outcomeAmountInfo: {
    total: 0,
    subscriptioned: 0,
    withdrawn: 0,
  },
  incomeAmountInfo: {
    total: 0,
    subscriptioned: 0,
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

export const $subscriptionCardsData = createStore<Record<string, SubscriptionCardData>>({});

export const $subscriptionsProgress = createStore<Record<string, SubscriptionProgressData>>({});

export const selectSubscription = createEvent<string | null>();
export const $selectedSubscription = createStore<string | null>(null);

// sample({
//   source: {
//     tokens: $tokens,
//     subscriptions: $accountSubscriptions,
//     priceOracle: $priceOracle,
//   },
//   fn({tokens, subscriptions: {inputs, outputs}, priceOracle}) {
//     const activeInputSubscriptions = inputs.filter(isActiveSubscription);
//     const activeOutputSubscriptions = outputs.filter(isActiveSubscription);
//     return {
//       outcomeAmountInfo: collectTotalFinancialAmountInfo(activeOutputSubscriptions, tokens, priceOracle),
//       incomeAmountInfo: collectTotalFinancialAmountInfo(activeInputSubscriptions, tokens, priceOracle),
//       availableForWithdrawal: countTotalUSDWithdrawal(activeInputSubscriptions, tokens, priceOracle),
//     };
//   },
//   target: $financialStatus,
// });

// sample({
//   source: $accountSubscriptions,
//   target: $subscriptionListData,
//   fn: ({subscriptionsLoaded, inputs, outputs}) => ({
//     subscriptionsLoading: !subscriptionsLoaded,
//     hasSubscriptions: inputs.length + outputs.length > 0,
//   }),
// });

sample({
  source: {
    subscriptions: $subscriptions,
    filter: $subscriptionFilter,
    accountId: $accountId,
    sort: $subscriptionSort,
  },
  target: $filteredSubscriptions,
  fn({subscriptions, filter: {status, text}, sort}) {
    const filters = [getStatusFilter(status), getTextFilter(text)].filter(
      (fn): fn is FilterFn => !!fn,
    );

    const result =
      filters.length === 0
        ? [...subscriptions]
        : subscriptions.filter((item) => filters.every((filter) => filter(item)));
    return result.sort(sort.fn);
  },
});

sample({
  source: {subscriptions: $subscriptions, filter: $subscriptionFilter, accountId: $accountId},
  target: $statusFilterCounts,
  fn({subscriptions}) {
    return Object.fromEntries(
      statusOptions.map((status) => {
        const statusFilter = getStatusFilter(status);
        const resultSubscriptions = statusFilter
          ? subscriptions.filter(statusFilter)
          : subscriptions;
        return [status, resultSubscriptions.length];
      }),
    ) as Record<StatusFilter, number>;
  },
});

sample({clock: changeSubscriptionSort, target: $subscriptionSort});

/** redraw progress bar each second */
sample({
  clock: [$filteredSubscriptions, progressRedrawTimerFx.doneData],
  filter: progressRedrawTimerFx.pending.map((pending) => !pending),
  target: [progressRedrawTimerFx],
});

/**
 * when filtered subscriptions or tokens are changed or redraw timer ends,
 * send actual data to retrigger event
 * */
sample({
  clock: [$filteredSubscriptions, $tokens, progressRedrawTimerFx.doneData],
  source: {
    oldData: $subscriptionsProgress,
    tokens: $tokens,
    subscriptions: $filteredSubscriptions,
  },
  target: $subscriptionsProgress,
  fn: ({oldData, subscriptions, tokens}) =>
    recordUpdater(oldData, subscriptions, (subscription) => {
      const {plan, stream} = subscription;
      const token = tokens[plan.tokenId];
      if (!token) return undefined;
      const {decimals} = token.meta;
      const symbol = isWNearTokenId(plan.tokenId) ? 'NEAR' : token.meta.symbol;
      const progress = getStreamProgress({stream});
      const streamed = Number(toHumanReadableValue(decimals, progress.streamed, 3));
      const total = Number(toHumanReadableValue(decimals, progress.full, 3));

      const streamedText = formatSmartly(streamed);
      const streamedPercentage = getRoundedPercentageRatio(progress.streamed, progress.full, 1);

      return {
        symbol,
        progressFull: progress.full,
        progressStreamed: progress.streamed,
        streamedText,
        totalText: total.toString(),
        streamedPercentage,
      };
    }),
});

sample({
  clock: $filteredSubscriptions,
  source: {
    oldData: $subscriptionCardsData,
    subscriptions: $filteredSubscriptions,
  },
  fn: ({oldData, subscriptions}) =>
    recordUpdater(oldData, subscriptions, (subscription) => {
      const {plan} = subscription;
      const endDate = calculateFinalDate(subscription.createdAt, plan.period);
      const iconType: keyof typeof STREAM_STATUS =
        typeof subscription.status === 'string' ? subscription.status : 'Finished';

      return {
        showAddFundsButton: plan.isEditable,
        showPauseButton: plan.isPausable,
        showStartButton: plan.isPausable,
        serviceName: 'Amazon Prime',
        serviceIcon:
          'https://www.telesurenglish.net/__export/1584731358366/sites/telesur/img/2020/03/20/amazon_2.jpg_1718483346.jpg',
        endDate: endDate ? format(endDate, 'dd MMM yyyy') : null,
        stream: subscription.stream,
        timeLeft: calculateTimeLeft(subscription.createdAt, plan.period),
        iconType,
      };
    }),
  target: $subscriptionCardsData,
});

sample({
  clock: selectSubscription,
  source: $selectedSubscription,
  filter: $isSmallScreen,
  fn: (currentSelection, upd) => (upd === currentSelection ? null : upd),
  target: $selectedSubscription,
});

sample({
  clock: $isSmallScreen,
  filter: (isSmallScreen) => !isSmallScreen,
  fn: () => null,
  target: $selectedSubscription,
});

$subscriptionFilter.on(changeStatusFilter, (filter, status) => ({...filter, status}));
$subscriptionFilter.on(changeTextFilter, (filter, text) => ({...filter, text}));
