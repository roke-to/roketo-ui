import {WalletSelector} from '@near-wallet-selector/core';
import {createStore} from 'effector';

export const $walletSelector = createStore<WalletSelector | null>(null);
