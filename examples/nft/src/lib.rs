/*!
Non-Fungible Token implementation with JSON serialization.
Roketo modification.
TODO desc
*/
use std::convert::TryFrom;

use near_contract_standards::non_fungible_token::core::{
    NonFungibleTokenCore, NonFungibleTokenResolver,
};
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata,
};
use near_contract_standards::non_fungible_token::{NonFungibleToken, Token, TokenId};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LazyOption;
use near_sdk::json_types::Base58CryptoHash;
use near_sdk::{
    assert_one_yocto, env, ext_contract, near_bindgen, require, AccountId, Balance,
    BorshStorageKey, Gas, PanicOnDefault, Promise, PromiseOrValue, ONE_NEAR,
};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata) -> Self {
        require!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
        }
    }

    #[payable]
    pub fn nft_mint(
        &mut self,
        token_id: TokenId,
        token_owner_id: AccountId,
        token_metadata: TokenMetadata,
    ) -> Token {
        assert_eq!(
            env::predecessor_account_id(),
            self.tokens.owner_id,
            "Unauthorized"
        );
        self.tokens
            .internal_mint(token_id, token_owner_id, Some(token_metadata))
    }

    pub fn nft_token(&self, token_id: TokenId) -> Option<Token> {
        self.tokens.nft_token(token_id)
    }

    /// Roketo custom code starts here
    ///
    /// TODO write description
    #[payable]
    pub fn nft_attach_stream(&mut self, token_id: TokenId, stream_id: Base58CryptoHash) {
        assert_eq!(
            env::predecessor_account_id(),
            self.tokens.owner_id,
            "Unauthorized"
        );
        assert_one_yocto();
        self.tokens.token_metadata_by_id.as_mut().and_then(|by_id| {
            let mut token = by_id.remove(&token_id).expect("Token must exist");
            assert_eq!(
                token.copies.expect("Copies should be described explicitly"),
                1
            );
            token.extra = Some((&stream_id).into());
            by_id.insert(&token_id, &token)
        });
    }

    #[payable]
    pub fn nft_detach_stream(&mut self, token_id: TokenId) {
        assert_eq!(
            env::predecessor_account_id(),
            self.tokens.owner_id,
            "Unauthorized"
        );
        assert_one_yocto();
        self.tokens.token_metadata_by_id.as_mut().and_then(|by_id| {
            let mut token = by_id.remove(&token_id).expect("Token must exist");
            token.extra = None;
            by_id.insert(&token_id, &token)
        });
    }

    #[payable]
    pub fn nft_transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
    ) {
        // This line is the main change.
        // Call roketo contract to update the stream receiver
        // as well as change the owner of the NFT.
        self.roketo_change_receiver(&receiver_id, &token_id);
        self.tokens.internal_transfer(
            &env::predecessor_account_id(),
            &receiver_id,
            &token_id,
            approval_id,
            memo,
        );
    }

    #[payable]
    pub fn nft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        _approval_id: Option<u64>,
        _memo: Option<String>,
        _msg: String,
    ) -> PromiseOrValue<bool> {
        // Disabled because of `assert_one_yocto` conflict.
        assert!(false, "Unimplemented");
        self.roketo_change_receiver(&receiver_id, &token_id);
        // However it's not a big deal to enable it.
        // Code from `nft_transfer_call` of NEP-141 must be inserted below.
        unreachable!()
    }
}

pub const ONE_TERA: u64 = Gas::ONE_TERA.0;

// Update the constants if exact values are known
pub const DEFAULT_GAS_FOR_ROKETO_TRANSFER: Gas = Gas(150 * ONE_TERA);
pub const DEFAULT_STORAGE_BALANCE: Balance = ONE_NEAR / 10;

#[ext_contract]
pub trait ExtRoketoContract {
    fn change_receiver(&mut self, stream_id: Base58CryptoHash, receiver_id: AccountId);
}

impl Contract {
    fn roketo_account_id() -> AccountId {
        // It's recommended to store the value of actual roketo account
        // within contract state to keep a possibility
        // to update it easily when needed, if not deployed yet.
        //
        // As update of the state might not be applicable for many
        // deployed contacts or may be difficult,
        // the simplest way of passing the constant is introduced here.
        "roketodapp.near".parse().unwrap()
    }

    fn roketo_change_receiver(
        &self,
        receiver_id: &AccountId,
        token_id: &TokenId,
    ) -> Option<Promise> {
        assert!(env::attached_deposit() >= DEFAULT_STORAGE_BALANCE);
        let token = self
            .tokens
            .token_metadata_by_id
            .as_ref()
            .unwrap()
            .get(token_id)
            .expect("Token must exist");
        if let Some(extra) = token.extra {
            Some(ext_roketo_contract::change_receiver(
                Base58CryptoHash::try_from(extra).unwrap(),
                receiver_id.clone(),
                Contract::roketo_account_id(),
                env::attached_deposit(),
                DEFAULT_GAS_FOR_ROKETO_TRANSFER,
            ))
        } else {
            None
        }
        // Returned promise is not processed to keep `nft_transfer` / `nft_transfer_call`
        // similar to non-streaming versions.
        //
        // Roketo guarantees to send remaining tokens to previous owner,
        // create a new account for the new owner (if not created yet)
        // and change receiver of the stream.
        //
        // Roketo relies on proper stream attached and correct values of
        // storage deposit for the token and gas to execute the request.
    }
}
///
/// Roketo custom code ends here

#[near_bindgen]
impl NonFungibleTokenResolver for Contract {
    #[private]
    fn nft_resolve_transfer(
        &mut self,
        previous_owner_id: AccountId,
        receiver_id: AccountId,
        token_id: TokenId,
        approved_account_ids: Option<std::collections::HashMap<AccountId, u64>>,
    ) -> bool {
        self.tokens.nft_resolve_transfer(
            previous_owner_id,
            receiver_id,
            token_id,
            approved_account_ids,
        )
    }
}

near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use std::collections::HashMap;
    use std::convert::TryFrom;

    use near_contract_standards::non_fungible_token::metadata::NFT_METADATA_SPEC;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::{testing_env, ONE_YOCTO};

    use super::*;

    const MINT_STORAGE_COST: u128 = 5870000000000000000000;

    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id);
        builder
    }

    fn sample_stream_id() -> Base58CryptoHash {
        Base58CryptoHash::try_from("E5KZ2Lh5sF7ey8Me8QiiuAgiCvbbgSHJ8Py9YGgbUPqr").unwrap()
    }

    fn sample_token_metadata() -> TokenMetadata {
        TokenMetadata {
            title: Some("Olympus Mons".into()),
            description: Some("The tallest mountain in the charted solar system".into()),
            media: None,
            media_hash: None,
            copies: Some(1u64),
            issued_at: None,
            expires_at: None,
            starts_at: None,
            updated_at: None,
            extra: None,
            reference: None,
            reference_hash: None,
        }
    }

    #[test]
    fn test_attach_detach_stream() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new(
            accounts(0).into(),
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: accounts(0).to_string(),
                symbol: accounts(0).to_string(),
                icon: None,
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
        );

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(MINT_STORAGE_COST)
            .predecessor_account_id(accounts(0))
            .build());

        let token_id = "0".to_string();
        contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(ONE_YOCTO)
            .predecessor_account_id(accounts(0))
            .build());

        contract.nft_attach_stream(token_id.clone(), sample_stream_id());
        let token = contract.nft_token(token_id.clone()).unwrap();
        assert_eq!(token.token_id, token_id);
        assert_eq!(token.owner_id, accounts(0));
        let mut metadata = sample_token_metadata();
        metadata.extra = Some((&sample_stream_id()).into());
        assert_eq!(token.metadata.unwrap(), metadata);
        assert_eq!(token.approved_account_ids.unwrap(), HashMap::new());

        contract.nft_detach_stream(token_id.clone());
        let token = contract.nft_token(token_id.clone()).unwrap();
        assert_eq!(token.token_id, token_id);
        assert_eq!(token.owner_id, accounts(0));
        assert_eq!(token.metadata.unwrap(), sample_token_metadata());
        assert_eq!(token.approved_account_ids.unwrap(), HashMap::new());
    }
}
