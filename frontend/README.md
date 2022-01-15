# Roke.to dApp frontend

## Run dev server
Dev server use .env.development
```$
# npm start
```
## Build for production

```$
# cp .env.<mainnet/testnet> .env.production.local
# npm run build
```

## .env
* .env.development - for local dev server
* .env.development.local - for override .env.development (git ignored)
* .env.production - for common vars
* .env.mainnet - for mainnet`s vars only
* .env.testnet - for testnet`s vars only
