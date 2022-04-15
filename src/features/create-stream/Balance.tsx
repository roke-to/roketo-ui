import { useRoketoContext } from 'app/roketo-context';
import { isWNearTokenId } from 'shared/helpers/isWNearTokenId';
import { useToken } from 'shared/hooks/useToken';

export function Balance({ tokenAccountId }: { tokenAccountId: string }) {
  const { auth } = useRoketoContext()
  const { balance, formatter, meta } = useToken(tokenAccountId);

  const actualBalance = isWNearTokenId(tokenAccountId)
    ? auth.balance?.available || '0'
    : balance;

  return (
    <span>
      Balance:
      {' '}
      {formatter.amount(actualBalance)}
      {' '}
      {meta.symbol}
    </span>
  );
}
