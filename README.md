# Roke.to dApp

## Run dev server

Dev server use `.env` and testnet by default

```bash
yarn start
```

## Build for production

```bash
# for mainnet
yarn build --mode mainnet

# for testnet
yarn build --mode testnet
```

## Configuration

How ViteJS handle environment variables and configs [read here](https://vitejs.dev/guide/env-and-mode.html).

- .env - for dev server with testnet
- .env.local - for override .env (git ignored)
- .env.mainnet - for mainnet`s vars production mode
- .env.testnet - for testnet`s vars production mode

# Links

- [Landing](https://app2.roke.to/) (webflow, outside repo)
- [dApp](https://app2.test.roke.to/) (testnet)
- [Docs](https://www.notion.so/roketo/Roketo-v2-contract-api-59c29437ae9f403a824536732d80e856)
