export function NearContractApi(near) {
  console.log('NearContractApi', near);

  const contract = near.contract;

  const getAccount = async (accountId) => {
    try {
      if (!accountId) {
        return [];
      }
      return await contract.get_account({ account_id: accountId });
    } catch (e) {
      console.log('near error', e);
    }
    return [];
  };

  const getCurrentAccount = () =>
    getAccount(near.walletConnection.getAccountId());

  return {
    getCurrentAccount,
    getAccount,
  };
}
