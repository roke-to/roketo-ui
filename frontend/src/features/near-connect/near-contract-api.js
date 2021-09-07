const GAS_SIZE = '200000000000000';
const NOT_ZERO_NEAR_AMOUNT = 1;

export function NearContractApi(near) {
  console.log('NearContractApi', near);

  const contract = near.contract;

  const getAccount = async (accountId) => {
    try {
      if (!accountId) {
        return [];
      }
      return await contract.get_account({account_id: accountId});
    } catch (e) {
      console.log('near error', e);
    }
    return [];
  };

  const getCurrentAccount = () =>
    getAccount(near.walletConnection.getAccountId());

  async function updateAccount({accountId}) {
    const res = await contract.update_account(
      {account_id: accountId},
      GAS_SIZE,
      0,
    );

    return res;
  }

  async function depositStream({streamId, deposit}) {
    const res = await contract.deposit(
      {stream_id: streamId},
      GAS_SIZE,
      deposit,
    );

    return res;
  }

  async function pauseStream({streamId}) {
    const res = await contract.pause_stream(
      {stream_id: streamId},
      GAS_SIZE,
      NOT_ZERO_NEAR_AMOUNT,
    );

    return res;
  }

  async function startStream({streamId}) {
    const res = await contract.start_stream(
      {stream_id: streamId},
      GAS_SIZE,
      NOT_ZERO_NEAR_AMOUNT,
    );

    return res;
  }

  async function stopStream({streamId}) {
    const res = await contract.stop_stream(
      {stream_id: streamId},
      GAS_SIZE,
      NOT_ZERO_NEAR_AMOUNT,
    );
    return res;
  }

  async function createStream({
    deposit,
    ownerId,
    receiverId,
    token,
    speed,
    description,
    autoDepositEnabled = false,
  }) {
    const res = await contract.create_stream(
      {
        owner_id: ownerId,
        receiver_id: receiverId,
        token_name: token,
        tokens_per_tick: speed,
        auto_deposit_enabled: autoDepositEnabled,
        description,
      },
      GAS_SIZE,
      deposit,
    );

    return res;
  }

  async function getStream({streamId}) {
    const res = await contract.get_stream({
      stream_id: streamId,
    });

    return res;
  }

  return {
    getCurrentAccount,
    updateAccount,
    getAccount,
    createStream,
    depositStream,
    pauseStream,
    startStream,
    stopStream,
    getStream,
  };
}
