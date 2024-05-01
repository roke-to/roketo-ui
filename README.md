# Roke.to dApp
This repo contains source codes of Roketo Web-DApp
![streams](https://github.com/roke-to/roketo-ui/assets/166130086/949f36ff-5fd7-4cae-88fe-2875337b1c7b)


## Prerequisites
To setup this application you will also need following applications deployed:
1) Roketo [contract](https://github.com/roke-to/roketo-contract) deployed
2) Roketo [API](https://github.com/roke-to/roketo-api)
   
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

- [Landing](https://www.roke.to/) ([repo](https://github.com/roke-to/roke.to))
