import {useStore} from 'effector-react';
import React from 'react';

import {$nearWallet, $priceOracle} from '~/entities/wallet';

import {useToken} from '~/shared/hooks/useToken';
import {isWNearTokenId} from '~/shared/lib/isWNearTokenId';

export function useBalanceForToken(tokenId: string) {
  const nearWallet = useStore($nearWallet);
  const {balance, formatter} = useToken(tokenId);

  const actualCryptoBalance = isWNearTokenId(tokenId)
    ? nearWallet?.auth.balance?.available ?? '0'
    : balance;

  return formatter.amount(actualCryptoBalance);
}

export enum DisplayMode {
  USD = 'USD',
  CRYPTO = 'CRYPTO',
  BOTH = 'BOTH',
}

type BalanceProps = {
  tokenAccountId: string;
  className?: string;
  // Display balance in USD or in Crypto currency
  mode?: DisplayMode;
};

export function Balance({tokenAccountId, className, mode = DisplayMode.CRYPTO}: BalanceProps) {
  const priceOracle = useStore($priceOracle);

  const {meta} = useToken(tokenAccountId);

  const displayedCryptoAmount = useBalanceForToken(tokenAccountId);

  const showInUSD = mode === DisplayMode.USD;

  const amount = showInUSD
    ? priceOracle.getPriceInUsd(tokenAccountId, displayedCryptoAmount) ?? 0
    : displayedCryptoAmount;
  const currencySymbol = showInUSD ? '$' : meta.symbol;

  return <span className={className}>{`Balance: ${currencySymbol} ${amount}`}</span>;
}
