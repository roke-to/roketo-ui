import React from 'react';

import { Button } from 'shared/kit/Button';
import { useRoketoContext } from 'app/roketo-context';
import { RoketoStream } from 'shared/api/roketo/interfaces/entities';

import {streamLib} from 'entites/stream';

export function WithdrawButton({ stream }: { stream: RoketoStream}) {
  const { tokens, roketo } = useRoketoContext();
  const available = streamLib.getAvailableToWithdraw(stream);
  const tokenAccountId = stream.token_account_id;
  const { formatter, meta: { symbol } } = tokens[tokenAccountId];
  const amount = formatter.amount(available.toFixed());

  const handleWithdraw = () => 
    roketo.api.withdraw({ streamIds: [ stream.id ] })

  return (
    <Button
      disabled={amount === '0'}
      type="button"
      loadingText="Withdraw..."
      variant="outlined"
      color="dark"
      onClick={handleWithdraw}
    >
      Withdraw {amount} {symbol}
    </Button>
  );
}
