import useSWR, {useSWRConfig} from 'swr';
import {useNear} from '../near-connect/useNear';
import {useStreamControl} from './useStreamControl';
import {Button} from '../../components/kit/Button';
import {TokenImage} from '../../components/kit/TokenImage';
import {Tooltip} from '../../components/kit/Tooltip';
import {useAccount, useStreams} from '../xyiming-resources';
import {useTokenFormatter} from '../../lib/useTokenFormatter';
import classNames from 'classnames';
import Modal from 'react-modal/lib/components/Modal';
import {useBool} from '../../lib/useBool';
import {useMemo} from 'react';

function TokenBalance({ticker, balance, className}) {
  const near = useNear();
  const tf = useTokenFormatter(ticker);
  const token = near.tokens.get(ticker);
  const balanceInt = tf.amount(balance);
  return (
    <div
      className={classNames(
        'inline-flex items-center p-2 rounded-lg bg-card2',
        className,
      )}
    >
      <TokenImage tokenName={ticker} className="mr-2"></TokenImage>{' '}
      <div>
        <div>
          <span className="font-semibold">{balanceInt}</span>{' '}
          <span className="text-gray">{ticker}</span>
        </div>
        <div>{token.metadata.name}</div>
      </div>
    </div>
  );
}

function useWithdrawReadyBalances() {
  const near = useNear();
  const accountSWR = useAccount({near});

  const streamsSWR = useStreams({near, accountSWR});

  let balances = useMemo(() => {
    let balances = {};
    if (accountSWR.data && streamsSWR.data) {
      accountSWR.data.ready_to_withdraw.forEach(([ticker, balance]) => {
        balances[ticker] = balances[ticker] || 0;
        balances[ticker] += Number(balance);
      });

      streamsSWR.data.inputs.forEach((stream) => {
        balances[stream.ticker] = balances[stream.ticker] || 0;
        balances[stream.ticker] += Number(stream.available_to_withdraw);
      });
    }

    return balances;
  }, [accountSWR.data, streamsSWR.data]);

  const tokensSWR = useSWR(
    () => {
      let balancesWithoutNear = {...balances};
      delete balancesWithoutNear['NEAR'];
      let keys = Object.keys(balancesWithoutNear);
      keys.sort();
      return JSON.stringify(keys);
    },
    (rawKeys) => {
      let tickers = JSON.parse(rawKeys);

      // [ticker, hasStorageBalance]
      return Promise.all(
        tickers.map(async (ticker) => [
          ticker,
          !!(await near.tokens.ftStorageBalance(ticker)),
        ]),
      );
    },
    {
      refreshInterval: 5000,
    },
  );

  let loading = !accountSWR.data || !streamsSWR.data || !tokensSWR.data;
  const notRegisteredTokens = (tokensSWR.data || []).filter(
    (t) => t[1] === false,
  );

  const tokensRequireManualDeposit = notRegisteredTokens.filter((token) =>
    near.roketo.isBridged(token[0]),
  );

  const isSafeToWithdraw =
    tokensRequireManualDeposit.length === 0 && tokensSWR.data;

  return {
    balances: Object.entries(balances),
    loading,
    tokensRequireManualDeposit,
    notRegisteredTokens,
    isSafeToWithdraw,
  };
}

export function StreamWithdrawButton(props) {
  const near = useNear();
  const streamControl = useStreamControl();
  const {mutate} = useSWRConfig();
  const modalControl = useBool(false);

  let {balances, loading, isSafeToWithdraw, notRegisteredTokens} =
    useWithdrawReadyBalances();

  async function updateAllAndWithdraw() {
    await streamControl.updateAllAndWithdraw({
      tokensWithoutStorage: notRegisteredTokens.length,
    });
    mutate(['account', near.near.accountId]);
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
        withdrawing. You can do it by buying any amount of{' '}
        {notRegisteredTokens.map((token) => token[0]).join(', ')} tokens at any
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

  balances = balances.map(([ticker, balance]) => (
    <TokenBalance
      ticker={ticker}
      balance={balance}
      className={'w-full mb-2'}
      key={ticker}
    ></TokenBalance>
  ));

  return (
    <>
      <Tooltip
        placement="bottom"
        align={{offset: [0, 20]}}
        offset={{bottom: 20}}
        overlay={
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
                  <div>{balances}</div>
                </>
              ) : (
                <p className="font-semibold text-center">
                  You have nothing to withdraw
                </p>
              )}
            </div>
          </div>
        }
      >
        <Button
          loadingText="Updating account..."
          {...props}
          loading={streamControl.loading}
          onClick={onClick}
        ></Button>
      </Tooltip>
      {modalControl.on ? modal : null}
    </>
  );
}
