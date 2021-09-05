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

use near_contract_standards::fungible_token::core_impl::ext_fungible_token;
use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedSet};
use near_sdk::json_types::{Base58CryptoHash, ValidAccountId, WrappedBalance, WrappedTimestamp};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, ext_contract, near_bindgen, AccountId, Balance, CryptoHash, Gas, PanicOnDefault, Promise,
    PromiseOrValue, Timestamp,
};

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Xyiming {
    // TODO put stats here
}

use near_sdk::json_types::U128;

#[near_bindgen]
impl Xyiming {
    #[init]
    pub fn new() -> Self {
        // init the contract
        Self {}
    }
}

#[near_bindgen]
impl FungibleTokenReceiver for Xyiming {
    fn ft_on_transfer(
        &mut self,
        #[allow(unused_variables)] sender_id: ValidAccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let stream_id: Base58CryptoHash = msg.try_into().unwrap();
        self.deposit_ft(stream_id, amount);
        PromiseOrValue::Value(U128::from(0))
    }
}

impl Xyiming {
    /// Accounts
    pub(crate) fn accounts() -> LookupMap<AccountId, Account> {
        LookupMap::new(b"a".to_vec())
    }

    /// Streams
    pub(crate) fn streams() -> LookupMap<StreamId, Stream> {
        LookupMap::new(b"c".to_vec())
    }
}
