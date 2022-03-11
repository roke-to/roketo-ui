import BigNumber from 'bignumber.js';
import { Account, Contract, WalletConnection } from 'near-api-js';

import { getEmptyAccount, GAS_SIZE, STORAGE_DEPOSIT } from './config';
import { RoketoContract } from './interfaces/contracts';
import { RoketoApi } from './interfaces/roketo-api';
import { RoketoTokenStatus, RoketoAccount } from './interfaces/entities';

export function RoketoContractApi({
  contract,
  ft,
  walletConnection,
  account,
  operationalCommission,
  tokens,
}: {
  contract: RoketoContract;
  ft: Record<
    string,
    {
      name: string;
      address: string;
      contract: Contract;
    }
  >;
  walletConnection: WalletConnection;
  account: Account;
  operationalCommission: string;
  tokens: Record<string, RoketoTokenStatus>;
}): RoketoApi {
  const getAccount = async (accountId: string): Promise<RoketoAccount> => {
    const fallback = getEmptyAccount(accountId);
    try {
      const newAccount = await contract.get_account({ account_id: accountId });
      return newAccount || fallback;
    } catch (e) {
      console.debug('[RoketoContractApi]: nearerror', e);
    }
    return fallback;
  };

  return {
    // account methods
    getCurrentAccount: () => getAccount(walletConnection.getAccountId()),
    updateAccount: async function updateAccount({
      tokensWithoutStorage = 0,
    }): Promise<void> {
      const res = await contract.update_account(
        {
          account_id: account.accountId,
        },
        GAS_SIZE,
        new BigNumber(STORAGE_DEPOSIT)
          .multipliedBy(tokensWithoutStorage)
          .plus(operationalCommission)
          .toFixed()
      );
      return res;
    },
    // stream methods
    getAccount,
    createStream: async function createStream(
      {
        deposit,
        receiverId,
        token,
        speed,
        description,
        autoDepositEnabled = false,
        isAutoStartEnabled = true,
      },
      { callbackUrl } = {}
    ) {
      let res;
      const createCommission = tokens[token].commission_on_create;

      try {
        if (token === 'NEAR') {
          // contract.methodName({ args, gas?, amount?, callbackUrl?, meta? })
          res = await contract.create_stream({
            args: {
              owner_id: walletConnection.getAccountId(),
              receiver_id: receiverId,
              token_name: token,
              tokens_per_tick: speed,
              description,
              is_auto_deposit_enabled: autoDepositEnabled,
              is_auto_start_enabled: isAutoStartEnabled,
            },
            gas: GAS_SIZE,
            amount: new BigNumber(deposit).plus(createCommission).toFixed(),
            callbackUrl,
          });
        } else {
          const tokenContract = ft[token].contract;
          // @ts-ignore
          res = await tokenContract.ft_transfer_call({
            args: {
              receiver_id: contract.contractId,
              amount: new BigNumber(deposit).plus(createCommission).toFixed(),
              memo: 'Roketo transfer',
              msg: JSON.stringify({
                Create: {
                  description,
                  owner_id: walletConnection.getAccountId(),
                  receiver_id: receiverId,
                  token_name: token,
                  tokens_per_tick: speed,
                  balance: deposit,
                  is_auto_deposit_enabled: autoDepositEnabled,
                  is_auto_start_enabled: isAutoStartEnabled,
                },
              }),
            },
            gas: GAS_SIZE,
            amount: 1,
            callbackUrl,
          });
        }
        return res;
      } catch (error) {
        console.debug(error);
        throw error;
      }
    },
    depositStream: async function depositStream({ streamId, token, deposit }) {
      if (token === 'NEAR') {
        await contract.deposit({ stream_id: streamId }, GAS_SIZE, deposit);
      } else {
        const tokenContract = ft[token].contract;

        // @ts-ignore
        await tokenContract.ft_transfer_call(
          {
            receiver_id: contract.contractId,
            amount: deposit,
            msg: JSON.stringify({
              Deposit: streamId,
            }),
          },
          GAS_SIZE,
          1
        );
      }
    },
    pauseStream: async function pauseStream({ streamId }) {
      const res = await contract.pause_stream(
        { stream_id: streamId },
        GAS_SIZE,
        operationalCommission
      );

      return res;
    },
    startStream: async function startStream({ streamId }) {
      const res = await contract.start_stream(
        { stream_id: streamId },
        GAS_SIZE,
        operationalCommission
      );

      return res;
    },
    stopStream: async function stopStream({ streamId }) {
      const res = await contract.stop_stream(
        { stream_id: streamId },
        GAS_SIZE,
        operationalCommission
      );
      return res;
    },
    changeAutoDeposit: async function changeAutoDeposit({
      streamId,
      autoDeposit,
    }) {
      const res = await contract.change_auto_deposit(
        { stream_id: streamId, auto_deposit: autoDeposit },
        GAS_SIZE,
        operationalCommission
      );

      return res;
    },
    // View methods
    getStream: async function getStream({ streamId }) {
      const res = await contract.get_stream({
        stream_id: streamId,
      });

      return res;
    },
    getStatus: async function getStatus() {
      const res = await contract.get_status({});
      return res;
    },
    getStreamHistory: async function getStreamHistory({ streamId, from, to }) {
      const res = await contract.get_stream_history({
        stream_id: streamId,
        from,
        to,
      });

      return res;
    },
  };
}
