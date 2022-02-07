use std::collections::{HashMap, HashSet};
use std::convert::TryInto;

mod account;
mod aurora;
mod dao;
mod err;
mod interface;
mod primitives;
mod stats;
mod stream;
mod stream_ops;
mod token;
mod unit_tests;
mod web4;

pub use crate::account::*;
pub use crate::aurora::*;
pub use crate::dao::*;
pub use crate::err::*;
pub use crate::interface::token_calls::*;
pub use crate::interface::views::*;
pub use crate::primitives::*;
pub use crate::stats::*;
pub use crate::stream::*;
pub use crate::token::*;

use near_contract_standards::fungible_token::core_impl::ext_fungible_token;
use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, UnorderedSet};
use near_sdk::json_types::{Base58CryptoHash, U128};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json;
use near_sdk::store::LazyOption;
use near_sdk::{
    assert_one_yocto, env, ext_contract, log, near_bindgen, AccountId, Balance, BorshStorageKey,
    CryptoHash, Gas, PanicOnDefault, Promise, PromiseOrValue, Timestamp, ONE_NEAR, ONE_YOCTO,
};

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    Accounts,
    Stats,
    Streams,
    ActiveIncomingStreams { account_id: AccountId },
    ActiveOutgoingStreams { account_id: AccountId },
    InactiveIncomingStreams { account_id: AccountId },
    InactiveOutgoingStreams { account_id: AccountId },
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub dao: Dao,
    pub accounts: UnorderedMap<AccountId, VAccount>,
    pub streams: UnorderedMap<StreamId, VStream>,
    pub stats: LazyOption<VStats>,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(dao_id: AccountId, utility_token_id: AccountId, utility_token_decimals: u8) -> Self {
        Self {
            dao: Dao::new(dao_id, utility_token_id, utility_token_decimals),
            accounts: UnorderedMap::new(StorageKey::Accounts),
            streams: UnorderedMap::new(StorageKey::Streams),
            stats: LazyOption::new(StorageKey::Stats, Some(Stats::default().into())),
        }
    }
}
