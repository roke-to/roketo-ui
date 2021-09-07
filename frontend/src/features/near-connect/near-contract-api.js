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

  const getStream = async (...args) => {
    try {
      console.log('???', args[1]);
      if (!args[1]) {
        return null; // TODO ?
      }
      return await contract.get_stream({stream_id: args[1]});
    } catch (e) {
      console.log('near error', e);
    }
    return null;
  };

  const getCurrentAccount = () =>
    getAccount(near.walletConnection.getAccountId());

  return {
    getCurrentAccount,
    getAccount,
    getStream,
  };
}
