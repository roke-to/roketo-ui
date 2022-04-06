import { useRoketoContext } from 'app/roketo-context';
import { env } from 'shared/config';
import { useToken } from 'shared/hooks/useToken';

export function Balance({ tokenAccountId }: { tokenAccountId: string }) {
  const { auth } = useRoketoContext()
  const { balance, formatter, meta } = useToken(tokenAccountId);

  // tmp: hard code for wNear
  const actualBalance = tokenAccountId === env.WNEAR_ID
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
