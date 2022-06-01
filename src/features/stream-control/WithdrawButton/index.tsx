import React from 'react';

import { Button, ButtonType, DisplayMode } from '@ui/components/Button';
import { useRoketoContext } from 'app/roketo-context';
import { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { Tooltip } from 'shared/kit/Tooltip';
import { streamViewData } from 'features/roketo-resource';
import { getAvailableToWithdraw } from 'shared/api/roketo/helpers';
import { testIds } from 'shared/constants';

import styles from './styles.module.scss';

type WithdrawButtonProps = {
  stream: RoketoStream;
} & Omit<React.ComponentProps<'button'>, 'type'>;

export function WithdrawButton({ stream, ...rest }: WithdrawButtonProps) {
  const { tokens, roketo } = useRoketoContext();
  const available = getAvailableToWithdraw(stream);
  const { percentages: { cliff, streamed } } = streamViewData(stream);
  const tokenAccountId = stream.token_account_id;
  const { formatter } = tokens[tokenAccountId];
  const amount = formatter.amount(available.toFixed());

  const handleWithdraw = (e: React.SyntheticEvent) => {
    e.preventDefault();

    roketo.api.withdraw({ streamIds: [ stream.id ] });
  }

  const hasPassedCliff = !cliff || streamed > cliff;

  const button = (
    <Button
      disabled={Number(amount) === 0}
      type={ButtonType.button}
      displayMode={hasPassedCliff ? DisplayMode.primary : DisplayMode.secondary}
      className={hasPassedCliff ? undefined : styles.notAllowed}
      onClick={handleWithdraw}
      testId={testIds.withdrawButton}
      {...rest}
    >
      Withdraw
    </Button>
  );

  return hasPassedCliff
    ? button
    : (
      <Tooltip
        placement="bottom"
        align={{ offset: [0, 20] }}
        overlay={(
          <div className={styles.hasntPassedCliff}>
            Cliff period isn't passed yet.
          </div>
        )}
      >
        {button}
      </Tooltip>
    );
}
