import {UpdateUserDto, User} from '@roketo/api-client';
import {attach, createDomain, createEffect, createEvent, createStore, sample} from 'effector';
import {ConnectedWalletAccount, Near} from 'near-api-js';

import {getAccount, initApiControl} from '~/shared/api/methods';
import {createNearInstance} from '~/shared/api/near';
import {usersApiClient} from '~/shared/api/roketo-client';
import {ApiControl, NearAuth, TransactionMediator} from '~/shared/api/types';
import {appStarted} from '~/shared/init';
import {getChangedFields} from '~/shared/lib/changeDetection';

import {retry} from '../lib/retry';

export const resetOnLogout = createDomain();

export const initWallets = createEvent();

export const $roketoWallet = resetOnLogout.createStore<null | ApiControl>(null);
export const $nearWallet = resetOnLogout.createStore<null | {
  near: Near;
  auth: NearAuth;
  walletType: 'near' | 'sender';
}>(null);
export const $walletLoading = createStore(true);
export const $user = resetOnLogout.createStore<Partial<User>>({
  name: '',
  email: '',
  isEmailVerified: false,
});

export const $account = $roketoWallet.map((wallet) => wallet?.roketoAccount ?? null);
export const $isSignedIn = $nearWallet.map((wallet) => wallet?.auth.signedIn ?? false);
export const $accountId = $nearWallet.map((wallet) => wallet?.auth.accountId ?? null);

export const accountRevalidationTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 30000);
    }),
);
export const createNearWalletFx = createEffect(
  async (walletType: 'near' | 'sender' | 'any' = 'any') => createNearInstance(walletType),
);
export const createRoketoWalletFx = createEffect(
  ({
    account,
    transactionMediator,
  }: {
    account: ConnectedWalletAccount;
    transactionMediator: TransactionMediator;
  }) => initApiControl({account, transactionMediator}),
);
export const getUserFx = createEffect(async (accountId: string) =>
  retry(() => usersApiClient.findOne(accountId)),
);

export const updateUserFx = attach({
  source: [$user, $accountId],
  async effect([user, accountId], nextUser: Partial<UpdateUserDto>) {
    if (accountId) {
      const updateUserDto: Partial<UpdateUserDto> = getChangedFields(nextUser, user);

      if (Object.keys(updateUserDto).length !== 0) {
        return usersApiClient.update(accountId, updateUserDto);
      }
    }
  },
});
export const loadAccountFx = attach({
  source: $roketoWallet,
  async effect(wallet) {
    if (wallet) {
      return getAccount(wallet);
    }
  },
});

sample({
  clock: [appStarted, initWallets],
  target: createNearWalletFx,
});

sample({
  clock: createNearWalletFx.doneData,
  target: $nearWallet,
});

sample({
  clock: createNearWalletFx.doneData,
  fn: ({auth}) => ({account: auth.account, transactionMediator: auth.transactionMediator}),
  target: createRoketoWalletFx,
});

/**
 * when roketo wallet becomes available or revalidation timer ends
 * start revalidation timer again
 * */
sample({
  clock: [createRoketoWalletFx.doneData, accountRevalidationTimerFx.doneData],
  target: accountRevalidationTimerFx,
});

sample({
  clock: createRoketoWalletFx.doneData,
  target: $roketoWallet,
});

sample({
  clock: createRoketoWalletFx.finally,
  fn: () => false,
  target: $walletLoading,
});

sample({
  clock: accountRevalidationTimerFx.doneData,
  target: loadAccountFx,
});

sample({
  clock: loadAccountFx.doneData,
  source: $roketoWallet,
  filter: (wallet, account) => wallet !== null && Boolean(account),
  fn: (wallet, account) => ({
    ...wallet!,
    roketoAccount: account!,
  }),
  target: $roketoWallet,
});

/** when account id is exists, request user info and notifications for it */
sample({
  clock: $accountId,
  filter: Boolean,
  target: getUserFx,
});

sample({
  clock: [getUserFx.doneData, updateUserFx.done.map(({params}) => params)],
  source: $user,
  fn: (user, nextUser) => ({
    ...user,
    ...nextUser,
    ...(user.email && nextUser.email !== user.email && {isEmailVerified: false}),
  }),
  target: $user,
});

/** clear user when there is no account id */
sample({
  clock: $accountId,
  filter: isEmpty,
  fn: () => ({name: '', email: '', isEmailVerified: false}),
  target: $user,
});

function isEmpty<T>(value: T | null): value is null {
  return value === null;
}
