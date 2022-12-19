import type {RoketoStream} from '@roketo/sdk/dist/types';
import classNames from 'classnames';
import React from 'react';

import {parseNftContract} from '~/shared/lib/vaultContract';

import {Button, ButtonType, DisplayMode} from '@ui/components/Button';

import {withdrawNFTx} from '../WithdrawAllButton/model';
import styles from './styles.module.scss';

type WithdrawButtonProps = {
  stream: RoketoStream;
  small?: boolean;
  className?: string;
} & Omit<React.ComponentProps<'button'>, 'type'>;

export function WithdrawNFTButton({
  stream,
  small = false,
  className,
  ...rest
}: WithdrawButtonProps) {
  const handleWithdraw = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const nftDetails = parseNftContract(stream.description);

    withdrawNFTx({
      nftContractId: nftDetails.nftContractId,
      nftId: nftDetails.nftId,
      fungibleToken: stream.token_account_id,
    });
  };

  return (
    <Button
      type={ButtonType.button}
      displayMode={DisplayMode.primary}
      className={classNames({[styles.small]: small}, className)}
      onClick={handleWithdraw}
      {...rest}
    >
      Withdraw
    </Button>
  );
}
