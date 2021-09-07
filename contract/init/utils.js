const path = require("path");
const homedir = require("os").homedir();

const nearApiJs = require("near-api-js");

const CREDENTIALS_DIR = ".near-credentials";
const NETWORK_ID = "testnet";
const NODE_URL = "https://rpc.testnet.near.org";

const FT_TOKEN = "dev-1630798753809-34755859843881";
const CONTRACT_ID = "dev-1631015258223-36596603302446";

function getCredentialsPath() {
  return path.join(homedir, CREDENTIALS_DIR);
}

async function createKeyStore(networkId = NETWORK_ID, keyPath = null) {
  return await new nearApiJs.keyStores.UnencryptedFileSystemKeyStore(
    getCredentialsPath()
  );
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

module.exports = {
  sleep,
  nearApiJs,
  CONTRACT_ID,
  CREDENTIALS_DIR,
  NETWORK_ID,
  NODE_URL,
  FT_TOKEN,
  createKeyStore,
};
