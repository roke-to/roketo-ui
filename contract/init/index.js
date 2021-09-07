const fs = require("fs");

const { Xyiming } = require("./xyiming");
const {
  FUNDING_ACCOUNT_ID,
  MAX_TRANSFER_BACK_AMOUNT,
  PUBLIC_KEY,
  getCredentialsPathForAccount,
  sleep,
} = require("./utils");

const xyiming = new Xyiming();

async function run(accountId) {
  await xyiming.init();
  //await xyiming.initContract();
  accounts = [
    "ololo.testnet",
    "pinkinice.testnet",
    "pinkinice2.testnet",
    "doxa2.testnet",
    "xyiming-kirill.testnet",
    "kirillarutyunov.testnet",
    "teke97.testnet",
  ];
  for (i = 0; i < accounts.length; i++) {
      while(true) {
          try {
            await xyiming.createStream(accounts[i], "kpr.testnet");
              break
          } catch(e) {
              console.log(e)
          }
      }
  }
}

async function run2(accountId) {
  await xyiming.init();
  await xyiming.initContract();
  accounts = [
    "a.testnet",
    "b.testnet",
    "c.testnet",
    "d.testnet",
    "e.testnet",
    "f.testnet",
    "g.testnet",
  ];
  for (i = 0; i < accounts.length; i++) {
      for (j = i + 1; j < accounts.length; j++) {
          console.log(accounts[i], accounts[j]);
        await xyiming.createStream(accounts[i], accounts[j]);
      }
  }
}

run();
