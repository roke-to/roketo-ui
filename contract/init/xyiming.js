const {
  nearApiJs,
  createKeyStore,
  ACCOUNT_ID_SUFFIX,
  MIN_BALANCE_ACCOUNT,
  NETWORK_ID,
  CONTRACT_ID,
  NODE_URL,
  FT_TOKEN,
} = require("./utils");

class Xyiming {
  async init() {
    this.keyStore = await createKeyStore();
    console.log(this.keyStore);
    this.inMemorySigner = new nearApiJs.InMemorySigner(this.keyStore);
    this.connection = nearApiJs.Connection.fromConfig({
      networkId: NETWORK_ID,
      provider: { type: "JsonRpcProvider", args: { url: NODE_URL + "/" } },
      signer: this.inMemorySigner,
    });
  }

  async storageDeposit(account) {
    const contract = new nearApiJs.Contract(account, FT_TOKEN, {
      viewMethods: [],
      changeMethods: ["storage_deposit"],
    });
    return await contract.storage_deposit(
      {},
      100000000000000,
      "10000000000000000000000"
    );
  }

  async initContract() {
    const account = await new nearApiJs.Account(this.connection, CONTRACT_ID);
    console.log(account);
    console.log(await this.storageDeposit(account));
      // call new
  }

  async createStream(accountId, otherAccountId) {
    const account = await new nearApiJs.Account(this.connection, CONTRACT_ID);
    const contract = new nearApiJs.Contract(account, CONTRACT_ID, {
      viewMethods: ["get_account", "get_stream"],
      changeMethods: [
        "create_stream",
        "deposit",
        "update_account",
        "start_stream",
        "pause_stream",
        "stop_stream",
      ],
    });
    console.log(
      await contract.create_stream(
        {
          description: "test stream",
          owner_id: otherAccountId,
          receiver_id: accountId,
          token_name: "NEAR",
          tokens_per_tick: "100000000000",
          auto_deposit_enabled: false,
        },
        300000000000000,
        "3600000000000000000000000"
      )
    );
    console.log(
      await contract.create_stream(
        {
          description: "test stream 2",
          owner_id: accountId,
          receiver_id: otherAccountId,
          token_name: "NEAR",
          tokens_per_tick: "100000000000",
          auto_deposit_enabled: false,
        },
        300000000000000,
        "9100000000000000000000000"
      )
    );
  }
}

module.exports = {
  Xyiming,
};
