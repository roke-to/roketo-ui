use std::convert::TryInto;

mod account;
mod bridge;
mod calls;
mod primitives;
mod stream;
mod views;

pub use crate::account::*;
pub use crate::bridge::*;
pub use crate::calls::*;
pub use crate::primitives::*;
pub use crate::stream::*;
pub use crate::views::*;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedSet};
use near_sdk::json_types::{Base58CryptoHash, ValidAccountId, WrappedBalance, WrappedTimestamp};
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
    /// Accounts
    pub(crate) fn accounts() -> LookupMap<AccountId, Account> {
        LookupMap::new(b"a".to_vec())
    }

    /// Bridges connecting streams
    pub(crate) fn bridges() -> LookupMap<BridgeId, Bridge> {
        LookupMap::new(b"b".to_vec())
    }

    /// Active or paused streams
    pub(crate) fn actual_streams() -> LookupMap<StreamId, Stream> {
        LookupMap::new(b"c".to_vec())
    }

    /// Stopped or finished streams
    pub(crate) fn terminated_streams() -> LookupMap<StreamId, Stream> {
        LookupMap::new(b"d".to_vec())
    }
}
