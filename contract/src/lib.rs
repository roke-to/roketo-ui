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
use near_sdk::collections::{LookupMap, UnorderedSet, Vector};
use near_sdk::json_types::{
    Base58CryptoHash, ValidAccountId, WrappedBalance, WrappedTimestamp, U128,
};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json;
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
        sender_id: ValidAccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        assert!(Xyiming::valid_ft_sender(env::predecessor_account_id()));
        let key: Result<CreateOrDeposit, _> = serde_json::from_str(&msg);
        if key.is_err() {
            // return everything back
            return PromiseOrValue::Value(amount);
        }
        match key.unwrap() {
            CreateOrDeposit::Create(create_struct) => {
                if self.create_stream_ft(
                    sender_id,
                    create_struct.description,
                    create_struct.owner_id,
                    create_struct.receiver_id,
                    // TODO!!
                    create_struct.token_name,
                    // TODO!!
                    create_struct.balance,
                    create_struct.tokens_per_tick,
                    create_struct.auto_deposit_enabled,
                ) {
                    PromiseOrValue::Value(U128::from(0))
                } else {
                    return PromiseOrValue::Value(amount);
                }
            }
            CreateOrDeposit::Deposit(stream_id) => {
                if self.deposit_ft(stream_id, amount) {
                    PromiseOrValue::Value(U128::from(0))
                } else {
                    return PromiseOrValue::Value(amount);
                }
            }
        }
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
