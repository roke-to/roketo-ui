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

- [Landing](https://www.roke.to/) (webflow, outside repo)
- [dApp](test.app-v2.roke.to) (testnet)
- [Docs](https://www.notion.so/kikimora-labs/Roketo-2056455fdcf4452f9e690601cc49d7a4)
- [API docs](/streaming/README.md)
