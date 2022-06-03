import classNames from 'classnames';
import React, {useMemo} from 'react';
import Modal from 'react-modal';
import useSWR, {useSWRConfig} from 'swr';

import {TokenImage} from '~/shared/kit/TokenImage';
import {Tooltip} from '~/shared/kit/Tooltip';

import {Button, DisplayMode} from '@ui/components/Button';

import {useBool} from '../../hooks/useBool';
import {useTokenFormatter} from '../../hooks/useTokenFormatter';
import {useRoketoContext} from '../../roketo-context';
import {useAccount, useLegacyStreams} from '../../roketo-resource';
import {useStreamControl} from './useStreamControl';

type TokenBalanceProps = {
  ticker: string;
  balance: number;
  className: string;
};

function TokenBalance({ticker, balance, className}: TokenBalanceProps) {
  const formatter = useTokenFormatter(ticker);
  const balanceInt = formatter.amount(balance);
  return (
    <div
      className={classNames('inline-flex items-center p-2 rounded-lg border', className)}
      style={{borderColor: '#A7B0BE'}}
    >
      <TokenImage tokenAccountId={ticker} className="mr-2" />{' '}
      <div>
        <div>
          <span className="font-semibold">{balanceInt}</span>{' '}
          <span className="text-gray">{ticker}</span>
        </div>
        <div>{ticker}</div>
      </div>
    </div>
  );
}

function useWithdrawReadyBalances() {
  const {roketo, tokens} = useRoketoContext();
  const accountSWR = useAccount();

  const streamsSWR = useLegacyStreams({account: accountSWR.data});

  const balances = useMemo(() => {
    const balancesValue: Record<string, number> = {};
    if (accountSWR.data && streamsSWR.data) {
      accountSWR.data.ready_to_withdraw.forEach(([ticker, balance]) => {
        balancesValue[ticker] = balancesValue[ticker] || 0;
        balancesValue[ticker] += Number(balance);
      });

      streamsSWR.data.inputs.forEach((stream) => {
        balancesValue[stream.ticker] = balancesValue[stream.ticker] || 0;
        balancesValue[stream.ticker] += Number(stream.available_to_withdraw);
      });
    }

    return balancesValue;
  }, [accountSWR.data, streamsSWR.data]);

  const tokensSWR = useSWR(
    () => {
      const {NEAR, ...balancesWithoutNear} = balances;
      const keys = Object.keys(balancesWithoutNear);
      keys.sort();
      return JSON.stringify(keys);
    },
    (rawKeys) => {
      const tickers: string[] = JSON.parse(rawKeys);

      return Promise.all(
        tickers.map(async (ticker) => ({
          ticker,
          hasStorageBalance: Boolean(await tokens.ftStorageBalance(ticker)),
        })),
      );
    },
    {
      refreshInterval: 5000,
    },
  );

  const loading = !accountSWR.data || !streamsSWR.data || !tokensSWR.data;
  const notRegisteredTokens = (tokensSWR.data || []).filter(
    ({hasStorageBalance}) => !hasStorageBalance,
  );

  const tokensRequireManualDeposit = notRegisteredTokens.filter(({ticker}) =>
    roketo.isBridged(ticker),
  );

  const isSafeToWithdraw = tokensRequireManualDeposit.length === 0 && tokensSWR.data;

  return {
    balances: Object.entries(balances),
    loading,
    tokensRequireManualDeposit,
    notRegisteredTokens,
    isSafeToWithdraw,
  };
}

type WithdrawAllButtonProps = {
  loadingText?: string;
  color?: string;
  children?: React.ReactNode;
  size?: 'normal' | 'big';
};

export function WithdrawAllButton(props: WithdrawAllButtonProps) {
  const {auth} = useRoketoContext();
  const streamControl = useStreamControl();
  const {mutate} = useSWRConfig();
  const modalControl = useBool(false);

  const {balances, loading, isSafeToWithdraw, notRegisteredTokens} = useWithdrawReadyBalances();

  async function updateAllAndWithdraw() {
    await streamControl.updateAllAndWithdraw({
      tokensWithoutStorage: notRegisteredTokens.length,
    });
    mutate(['account', auth.accountId]);
  }

  async function showNEP141Popup() {
    modalControl.setOn(true);
  }

  const modal = (
    <Modal
      isOpen={modalControl.on}
      onRequestClose={modalControl.turnOff}
      className="ModalContent"
      overlayClassName="ModalOverlay"
    >
      <h2 className="text-2xl mb-6">Restricted withdrawal</h2>
      <p>
        Due to NEP-141 issues you are required to do storage deposit before withdrawing. You can do
        it by buying any amount of {notRegisteredTokens.map(({ticker}) => ticker).join(', ')} tokens
        at any DEX
      </p>
    </Modal>
  );

  const onClick = loading
    ? () => {}
    : () => {
        if (isSafeToWithdraw) {
          updateAllAndWithdraw();
        } else {
          showNEP141Popup();
        }
      };

  return (
    <>
      <Tooltip
        placement="bottom"
        align={{offset: [0, 20]}}
        overlay={
          <div className="text-left">
            <p className="mb-4 text-gray">
              Move all received tokens to your wallet. With Roketo you can only withdraw from all
              your legacy streams simultaneously.
            </p>
            <div className="text-left">
              {loading ? (
                <p className="font-semibold text-center">Loading balances...</p>
              ) : balances.length ? (
                <>
                  <p className="font-semibold mb-2">Available balances:</p>
                  <div>
                    {balances.map(([ticker, balance]) => (
                      <TokenBalance
                        ticker={ticker}
                        balance={balance}
                        className="w-full mb-2"
                        key={ticker}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="font-semibold text-center">You have nothing to withdraw</p>
              )}
            </div>
          </div>
        }
      >
        <Button {...props} onClick={onClick} displayMode={DisplayMode.action} />
      </Tooltip>
      {modalControl.on ? modal : null}
    </>
  );
}
