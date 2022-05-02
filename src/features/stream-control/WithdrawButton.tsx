import React from 'react';

import {Button, ButtonType, DisplayMode} from '@ui/components/Button';
import {useRoketoContext} from 'app/roketo-context';
import {RoketoStream} from 'shared/api/roketo/interfaces/entities';

import {getAvailableToWithdraw} from 'shared/api/roketo/helpers';

export function WithdrawButton({ stream }: { stream: RoketoStream}) {
  const { tokens, roketo } = useRoketoContext();
  const available = getAvailableToWithdraw(stream);
  const tokenAccountId = stream.token_account_id;
  const { formatter } = tokens[tokenAccountId];
  const amount = formatter.amount(available.toFixed());

  const handleWithdraw = (e: React.SyntheticEvent) => {
    e.preventDefault();

    roketo.api.withdraw({ streamIds: [ stream.id ] });
  }

  return (
    <Button
      disabled={Number(amount) === 0}
      type={ButtonType.button}
      displayMode={DisplayMode.primary}
      onClick={handleWithdraw}
    >
      Withdraw
    </Button>
  );
}
