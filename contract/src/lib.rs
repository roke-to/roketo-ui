use std::convert::TryInto;

mod account;
mod calls;
mod primitives;
mod stream;
mod views;

pub use crate::account::*;
pub use crate::calls::*;
pub use crate::primitives::*;
pub use crate::stream::*;
pub use crate::views::*;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{TreeMap, UnorderedMap, Vector};
use near_sdk::json_types::{ValidAccountId, WrappedBalance, WrappedTimestamp};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, near_bindgen, AccountId, Balance, CryptoHash, PanicOnDefault, Promise, Timestamp,
};

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Xyiming {
    // TODO put stats here
}

#[near_bindgen]
impl Xyiming {
    #[init]
    pub fn new() -> Self {
        // init the contract
        Self {}
    }
}

impl Xyiming {
    /// Accounts of the streams
    pub(crate) fn accounts() -> TreeMap<AccountId, Account> {
        TreeMap::new(b"a".to_vec())
    }

    /// Actual streaming streams
    pub(crate) fn streams() -> UnorderedMap<StreamId, Stream> {
        UnorderedMap::new(b"c".to_vec())
    }

    /// Streams move from `streams` to `finished` when they're done
    pub(crate) fn finished() -> UnorderedMap<StreamId, Stream> {
        UnorderedMap::new(b"f".to_vec())
    }
}
