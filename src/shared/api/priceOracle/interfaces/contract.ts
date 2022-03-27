import {Contract} from 'near-api-js';

import {TokenPriceValueCollection} from './entites';

type ContractViewFunction<P, R> = (params: P) => Promise<R>;

export type PriceOracleContract = Contract & {
  // View
  get_assets: ContractViewFunction<{}, TokenPriceValueCollection>;

  // TODO: check get_oracle_price_data https://github.com/NearDeFi/price-oracle/blob/main/src/lib.rs#L137
};
