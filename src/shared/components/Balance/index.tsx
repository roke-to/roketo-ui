import { useRoketoContext } from 'app/roketo-context';
import { isWNearTokenId } from 'shared/helpers/isWNearTokenId';
import { useToken } from 'shared/hooks/useToken';

const USD_MODE = 'usd';
const CRYPTO_MODE = 'crypto'

type BalanceProps = {
  tokenAccountId: string,
  className?: string,
  // Отображать баланс в долларовом эквиваленте или в криптовалюте
  mode?: 'usd' | 'crypto',
}

export function Balance({ tokenAccountId, className, mode = CRYPTO_MODE }: BalanceProps) {
  const { auth, priceOracle } = useRoketoContext()
  const { balance, formatter, meta } = useToken(tokenAccountId);

  const actualCryptoBalance = isWNearTokenId(tokenAccountId)
    ? auth.balance?.available || '0'
    : balance;
  const displayedCryptoAmount = formatter.amount(actualCryptoBalance);

  const showInUSD = mode === USD_MODE;

  const amount = showInUSD
    ? priceOracle.getPriceInUsd(tokenAccountId, displayedCryptoAmount)
    : displayedCryptoAmount;
  const currencySymbol = showInUSD ? '$' : meta.symbol;

  return (
    <span className={className}>
      {`Balance ${amount} ${currencySymbol}`}
    </span>
  );
}
