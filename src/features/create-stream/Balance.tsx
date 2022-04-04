import BigNumber from 'bignumber.js';
import { useToken } from 'shared/hooks/useToken';

export function Balance({ deposit, tokenAccountId }: { deposit: string, tokenAccountId: string }) {
  const { balance, formatter, meta, api, isRegistered } = useToken(tokenAccountId);

  const isNeedAddDeposit = (Number(balance) - Number(deposit)) <= 0;
  const addedDeposit = Number(deposit) - Number(balance);

  const handleAddDeposit = () => {
    api.nearDeposit(new BigNumber(addedDeposit).toFixed());
  }
  const handleStorageDeposit = () => {
    api.storageDeposit();
  }

  return (
    <span>
      Balance:
      {' '}
      {formatter.amount(balance)}
      {' '}
      {meta.symbol}
      {isRegistered && isNeedAddDeposit &&
        <button
          type="button"
          onClick={() => handleAddDeposit()}
          className="hover:text-blue"
        >
          add {formatter.amount(addedDeposit)} {meta.symbol}
        </button>
      }

      {!isRegistered &&
        <button
          type="button"
          onClick={() => handleStorageDeposit()}
          className="hover:text-blue"
        >
          register account
        </button>
      }
    </span>
  );
}
