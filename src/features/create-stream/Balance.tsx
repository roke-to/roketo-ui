import BigNumber from 'bignumber.js';
import { useTokenFormatter } from 'shared/hooks/useTokenFormatter';

export function Balance({ deposit, tokenAccountId }: { deposit: string, tokenAccountId: string }) {
  const { balance, formatter, meta, api } = useTokenFormatter(tokenAccountId);

  const isNeedAddDeposit = (Number(balance) - Number(deposit)) <= 0;
  const addedDeposit = Number(deposit) - Number(balance);

  const handleAddDeposit = () => {
    api.nearDeposit(new BigNumber(addedDeposit).toFixed());
    
  }

  return (
    <span>
      Balance:
      {' '}
      {formatter.amount(balance)}
      {' '}
      {meta.symbol}
      {isNeedAddDeposit &&
        <button
          type="button"
          onClick={() => handleAddDeposit()}
          className="hover:text-blue"
        >
          add {formatter.amount(addedDeposit)} {meta.symbol}
        </button>
      }
    </span>
  );
}
