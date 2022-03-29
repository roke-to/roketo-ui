import React, { useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import Modal from 'react-modal';

import { Button } from 'shared/kit/Button';
import { Tooltip } from 'shared/kit/Tooltip';
import { useBool } from 'shared/hooks/useBool';
import { useRoketoContext } from 'app/roketo-context';
import { useStreams } from 'features/roketo-resource';

import { useStreamControl } from './useStreamControl';

// type TokenBalanceProps = {
//   ticker: string;
//   balance: number;
//   className: string;
// };

// function TokenBalance({ ticker, balance, className }: TokenBalanceProps) {
//   const { tokens } = useRoketoContext();
//   // const tf = useTokenFormatter(ticker);
//   const token = tokens.get(ticker);
//   const balanceInt = tf.amount(balance);

//   return (
//     <div
//       className={classNames(
//         'inline-flex items-center p-2 rounded-lg bg-card2',
//         className,
//       )}
//     >
//       <TokenImage tokenName={ticker} className="mr-2" />
//       {' '}
//       <div>
//         <div>
//           <span className="font-semibold">{balanceInt}</span>
//           {' '}
//           <span className="text-gray">{ticker}</span>
//         </div>
//         <div>{token.metadata.name}</div>
//       </div>
//     </div>
//   );
// }

function useWithdrawReadyBalances() {
  const streamsSWR = useStreams();

  const balances = useMemo(() => {
    const balancesValue: Record<string, number> = {};
    if (streamsSWR.data) {
      // accountSWR.data.ready_to_withdraw.forEach(([ticker, balance]) => {
      //   balancesValue[ticker] = balancesValue[ticker] || 0;
      //   balancesValue[ticker] += Number(balance);
      // });

      // streamsSWR.data.inputs.forEach((stream) => {
      //   balancesValue[stream.ticker] = balancesValue[stream.ticker] || 0;
      //   balancesValue[stream.ticker] += Number(stream.available_to_withdraw);
      // });
    }

    return balancesValue;
  }, [streamsSWR.data]);

  const tokensSWR = useSWR(
    () => {
      const { NEAR, ...balancesWithoutNear } = balances;
      const keys = Object.keys(balancesWithoutNear);
      keys.sort();
      return JSON.stringify(keys);
    },
    (rawKeys) => {
      const tickers: string[] = JSON.parse(rawKeys);

      return Promise.all(
        tickers.map(async (ticker) => ({
          ticker,
          hasStorageBalance: true,
        })),
      );
    },
    {
      refreshInterval: 5000,
    },
  );

  const loading = !streamsSWR.data || !tokensSWR.data;
  const notRegisteredTokens = (tokensSWR.data || []).filter(
    ({ hasStorageBalance }) => !hasStorageBalance,
  );

  const tokensRequireManualDeposit = notRegisteredTokens;
  // .filter(
  //   ({ ticker }) => roketo.isBridged(ticker),
  // );

  const isSafeToWithdraw = tokensRequireManualDeposit.length === 0 && tokensSWR.data;

  return {
    balances: Object.entries(balances),
    loading,
    tokensRequireManualDeposit,
    notRegisteredTokens,
    isSafeToWithdraw,
  };
}

type StreamWithdrawButtonProps = {
  loadingText?: string;
  variant: string;
  color?: string;
  children?: React.ReactNode;
  size?: 'normal' | 'big';
};

export function StreamWithdrawButton(props: StreamWithdrawButtonProps) {
  const { auth } = useRoketoContext();
  const streamControl = useStreamControl();
  const { mutate } = useSWRConfig();
  const modalControl = useBool(false);

  const {
    balances, loading, isSafeToWithdraw, notRegisteredTokens,
  } = useWithdrawReadyBalances();

  async function updateAllAndWithdraw() {
    await streamControl.updateAllAndWithdraw();
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
        Due to NEP-141 issues you are required to do storage deposit before
        withdrawing. You can do it by buying any amount of
        {' '}
        {notRegisteredTokens.map(({ ticker }) => ticker).join(', ')}
        {' '}
        tokens at any
        DEX
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
        align={{ offset: [0, 20] }}
        overlay={(
          <div className="text-left">
            <p className="mb-4 text-gray">
              Move all received tokens to your wallet. With Roketo you can only
              withdraw from all your streams simultaneously.
            </p>
            <div className="text-left">
              {loading ? (
                <p className="font-semibold text-center">Loading balances...</p>
              ) : balances.length ? (
                <>
                  <p className="font-semibold mb-2">Available balances:</p>
                  <div>
                    {/* {balances.map(([ticker, balance]) => (
                      <TokenBalance
                        ticker={ticker}
                        balance={balance}
                        className="w-full mb-2"
                        key={ticker}
                      />
                    ))} */}
                  </div>
                </>
              ) : (
                <p className="font-semibold text-center">
                  You have nothing to withdraw
                </p>
              )}
            </div>
          </div>
        )}
      >
        <Button
          type="button"
          loadingText="Updating account..."
          {...props}
          loading={streamControl.loading}
          onClick={onClick}
        />
      </Tooltip>
      {modalControl.on ? modal : null}
    </>
  );
}
