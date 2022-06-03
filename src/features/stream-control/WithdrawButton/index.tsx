import classNames from 'classnames';
import {useStore} from 'effector-react';
import React from 'react';

import {$roketoWallet, $tokens} from '~/entities/wallet';
import {streamViewData} from '~/features/roketo-resource';
import {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {getAvailableToWithdraw} from '~/shared/api/roketo/lib';
import {testIds} from '~/shared/constants';
import {Tooltip} from '~/shared/kit/Tooltip';

import {Button, ButtonType, DisplayMode} from '@ui/components/Button';

import styles from './styles.module.scss';

type WithdrawButtonProps = {
  stream: RoketoStream;
  small?: boolean;
} & Omit<React.ComponentProps<'button'>, 'type'>;

export function WithdrawButton({stream, small = false, ...rest}: WithdrawButtonProps) {
  const tokens = useStore($tokens);
  const wallet = useStore($roketoWallet);
  const available = getAvailableToWithdraw(stream);
  const {
    percentages: {cliff, streamed},
  } = streamViewData(stream);
  const tokenAccountId = stream.token_account_id;
  const {formatter} = tokens[tokenAccountId];
  const amount = formatter.amount(available.toFixed());

  const handleWithdraw = (e: React.SyntheticEvent) => {
    e.preventDefault();
    wallet?.roketo.api.withdraw({streamIds: [stream.id]});
  };

  const hasPassedCliff = !cliff || streamed > cliff;

  const button = (
    <Button
      disabled={Number(amount) === 0}
      type={ButtonType.button}
      displayMode={hasPassedCliff ? DisplayMode.primary : DisplayMode.secondary}
      className={classNames({[styles.notAllowed]: !hasPassedCliff, [styles.small]: small})}
      onClick={hasPassedCliff ? handleWithdraw : undefined}
      testId={testIds.withdrawButton}
      {...rest}
    >
      Withdraw
    </Button>
  );

  return hasPassedCliff ? (
    button
  ) : (
    <Tooltip
      placement="bottom"
      align={{offset: [0, 20]}}
      overlay={<div className={styles.hasntPassedCliff}>Cliff period isn't passed yet.</div>}
    >
      {button}
    </Tooltip>
  );
}
