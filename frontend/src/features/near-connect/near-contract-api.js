import BigNumber from 'bignumber.js';

const GAS_SIZE = '200000000000000';
const GAS_SIZE_CRON = '300000000000000';
const STORAGE_DEPOSIT = 1e22;

export function NearContractApi({
  contract,
  ft,
  walletConnection,
  account,
  operationalCommission,
  tokens,
}) {
  const getAccount = async (accountId) => {
    const fallback = {
      account_id: accountId,
      dynamic_inputs: [],
      dynamic_outputs: [],
      static_streams: [],
      last_action: null,
      ready_to_withdraw: [],
      total_incoming: [],
      total_outgoing: [],
      total_received: [],
      is_external_update_enabled: false,
      cron_task: null,
    };

    try {
      const currentAccount = await contract.get_account({ account_id: accountId });
      return currentAccount || fallback;
    } catch (e) {
      console.debug('near error', e);
    }
    return fallback;
  };

  const getCurrentAccount = () => getAccount(walletConnection.getAccountId());

  async function updateAccount({ tokensWithoutStorage = 0 }) {
    const res = await contract.update_account(
      {
        account_id: account.accountId,
      },
      GAS_SIZE,
      new BigNumber(STORAGE_DEPOSIT)
        .multipliedBy(tokensWithoutStorage)
        .plus(operationalCommission)
        .toFixed(),
    );
    return res;
  }

  async function changeAutoDeposit({ streamId, autoDeposit }) {
    const res = await contract.change_auto_deposit(
      { stream_id: streamId, auto_deposit: autoDeposit },
      GAS_SIZE,
      operationalCommission,
    );

    return res;
  }

  async function depositStream({ streamId, token, deposit }) {
    if (token === 'NEAR') {
      await contract.deposit({ stream_id: streamId }, GAS_SIZE, deposit);
    } else {
      const tokenContract = ft[token].contract;

      await tokenContract.ft_transfer_call(
        {
          receiver_id: contract.contractId,
          amount: deposit,
          memo: 'xyiming transfer',
          msg: JSON.stringify({
            Deposit: streamId,
          }),
        },
        GAS_SIZE,
        1,
      );
    }
  }

  async function pauseStream({ streamId }) {
    const res = await contract.pause_stream(
      { stream_id: streamId },
      GAS_SIZE,
      operationalCommission,
    );

    return res;
  }

  async function startStream({ streamId }) {
    const res = await contract.start_stream(
      { stream_id: streamId },
      GAS_SIZE,
      operationalCommission,
    );

    return res;
  }

  async function stopStream({ streamId }) {
    const res = await contract.stop_stream(
      { stream_id: streamId },
      GAS_SIZE,
      operationalCommission,
    );
    return res;
  }

  async function createStream(
    {
      deposit,
      receiverId,
      token,
      speed,
      description,
      autoDepositEnabled = false,
      isAutoStartEnabled = true,
    },
    { callbackUrl } = {},
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
  }

  async function getStream({ streamId }) {
    const res = await contract.get_stream({
      stream_id: streamId,
    });

    return res;
  }

  async function getStreamHistory({ streamId, from, to }) {
    const res = await contract.get_stream_history({
      stream_id: streamId,
      from,
      to,
    });

    return res;
  }

  async function startCron() {
    const res = await contract.start_cron(
      {},
      GAS_SIZE_CRON,
      operationalCommission,
    );

    return res;
  }

  /**
   * fetches general info about contract: Supported FT tokens, commision %
   */
  async function getStatus() {
    const res = await contract.get_status({});
    return res;
  }

  return {
    getStatus,
    // account methods
    getCurrentAccount,
    updateAccount,
    // stream methods
    getAccount,
    createStream,
    depositStream,
    pauseStream,
    startStream,
    stopStream,
    getStream,
    getStreamHistory,
    changeAutoDeposit,
    // cron methods
    startCron,
  };
}
