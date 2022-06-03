import React from 'react'
import {useStore} from 'effector-react';
import {$nearWallet, $priceOracle} from '~/entities/wallet';
import { isWNearTokenId } from '~/shared/helpers/isWNearTokenId';
import { useToken } from '~/shared/hooks/useToken';

export enum DisplayMode {
  USD = 'USD',
  CRYPTO = 'CRYPTO',
  BOTH = 'BOTH',
}

type BalanceProps = {
  tokenAccountId: string,
  className?: string,
  // Display balance in USD or in Crypto currency
  mode?: DisplayMode,
}

export function Balance({ tokenAccountId, className, mode = DisplayMode.CRYPTO }: BalanceProps) {
  const priceOracle = useStore($priceOracle);
  const nearWallet = useStore($nearWallet);
  const { balance, formatter, meta } = useToken(tokenAccountId);

  const actualCryptoBalance = isWNearTokenId(tokenAccountId)
    ? nearWallet?.auth.balance?.available ?? '0'
    : balance;
  const displayedCryptoAmount = formatter.amount(actualCryptoBalance);

  const showInUSD = mode === DisplayMode.USD;

  const amount = showInUSD
    ? priceOracle.getPriceInUsd(tokenAccountId, displayedCryptoAmount) ?? 0
    : displayedCryptoAmount;
  const currencySymbol = showInUSD ? '$' : meta.symbol;

  return (
    <span className={className}>
      {`Balance: ${currencySymbol} ${amount}`}
    </span>
  );
}
