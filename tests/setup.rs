use std::collections::HashMap;

use contract::ContractContract as RoketoContract;
pub use contract::{
    AccountView, ContractError, CreateRequest, Dao, SafeFloat, Stats, Stream, StreamFinishReason,
    StreamStatus, Token, TokenStats, TransferCallRequest, DEFAULT_GAS_FOR_FT_TRANSFER,
    DEFAULT_GAS_FOR_STORAGE_DEPOSIT, DEFAULT_STORAGE_BALANCE, MAX_AMOUNT, MAX_STREAMING_SPEED,
    MIN_STREAMING_SPEED, ONE_TERA,
};
use near_contract_standards::fungible_token::metadata::{FungibleTokenMetadata, FT_METADATA_SPEC};
pub use near_sdk::json_types::{Base58CryptoHash, U128};
pub use near_sdk::serde_json::json;
pub use near_sdk::{env, serde_json, AccountId, Balance, Timestamp, ONE_NEAR, ONE_YOCTO};
use near_sdk_sim::runtime::GenesisConfig;
use near_sdk_sim::{
    deploy, init_simulator, to_yocto, ContractAccount, ExecutionResult, UserAccount,
};

near_sdk_sim::lazy_static_include::lazy_static_include_bytes! {
    ROKETO_WASM_BYTES => "res/roketo.wasm",
    FUNGIBLE_TOKEN_WASM_BYTES => "res/fungible_token.wasm",
    AURORA_WASM_BYTES => "res/aurora.wasm",
}

pub const NEAR: &str = "near";
pub const ROKETO_ID: &str = "roketo.near";
pub const ROKETO_TOKEN_ID: &str = "token.roketo.near";
pub const DAO_ID: &str = "dao.near";

pub type Gas = u64; // Gas is really bad in 4.0.0

pub const T_GAS: Gas = 1_000_000_000_000;
pub const DEFAULT_GAS: Gas = 15 * T_GAS;
pub const MAX_GAS: Gas = 300 * T_GAS;

pub const ROKETO_TOKEN_DECIMALS: u8 = 18;
pub const ROKETO_TOKEN_TOTAL_SUPPLY: Balance =
    1_000_000_000 * 10u128.pow(ROKETO_TOKEN_DECIMALS as _);

pub struct Env {
    pub root: UserAccount,
    pub near: UserAccount,
    pub dao: UserAccount,
    pub contract: ContractAccount<RoketoContract>,
    pub roketo_token: UserAccount,

    pub streams: HashMap<String, Balance>,
}

pub struct Tokens {
    pub wnear: UserAccount,
    pub dacha: UserAccount,
    pub ndai: UserAccount,
    pub nusdt: UserAccount,
    pub aurora: UserAccount,
}

pub struct Users {
    pub alice: UserAccount,
    pub bob: UserAccount,
    pub charlie: UserAccount,
    pub dude: UserAccount,
    pub eve: UserAccount,
}

pub fn storage_deposit(
    user: &UserAccount,
    contract_id: &AccountId,
    account_id: &AccountId,
    attached_deposit: Balance,
) {
    user.call(
        contract_id.clone(),
        "storage_deposit",
        &json!({ "account_id": account_id }).to_string().into_bytes(),
        DEFAULT_GAS,
        attached_deposit,
    )
    .assert_success();
}

pub fn ft_storage_deposit(
    user: &UserAccount,
    token_account_id: &AccountId,
    account_id: &AccountId,
) {
    storage_deposit(
        user,
        token_account_id,
        account_id,
        125 * env::STORAGE_PRICE_PER_BYTE,
    );
}

pub fn to_nano(timestamp: u64) -> Timestamp {
    Timestamp::from(timestamp) * 10u64.pow(9)
}

impl Env {
    pub fn init() -> Self {
        let mut genesis_config = GenesisConfig::default();
        genesis_config.block_prod_time = 0;
        let root = init_simulator(Some(genesis_config));
        let near = root.create_user(
            AccountId::new_unchecked(NEAR.to_string()),
            to_yocto("1000000"),
        );
        let dao = near.create_user(DAO_ID.parse().unwrap(), to_yocto("10000"));
        let dao_id = dao.account_id();
        let utility_token_id = ROKETO_TOKEN_ID.parse().unwrap();
        let utility_token_decimals = 18;

        let contract = deploy!(
            contract: RoketoContract,
            contract_id: ROKETO_ID.to_string(),
            bytes: &ROKETO_WASM_BYTES,
            signer_account: near,
            deposit: to_yocto("20"),
            gas: DEFAULT_GAS,
            init_method: new(
                dao_id,
                utility_token_id,
                utility_token_decimals
            )
        );

        let roketo_token = contract.user_account.deploy_and_init(
            &FUNGIBLE_TOKEN_WASM_BYTES,
            ROKETO_TOKEN_ID.parse().unwrap(),
            "new",
            &json!({
                "owner_id": near.account_id(),
                "total_supply": U128::from(ROKETO_TOKEN_TOTAL_SUPPLY),
                "metadata": FungibleTokenMetadata {
                    spec: FT_METADATA_SPEC.to_string(),
                    name: "Roketo Token".to_string(),
                    symbol: "ROKE".to_string(),
                    icon: None,
                    reference: None,
                    reference_hash: None,
                    decimals: ROKETO_TOKEN_DECIMALS,
                }
            })
            .to_string()
            .into_bytes(),
            to_yocto("10"),
            DEFAULT_GAS,
        );

        ft_storage_deposit(&near, &roketo_token.account_id(), &contract.account_id());

        Self {
            root,
            near,
            dao,
            contract,
            roketo_token,

            streams: HashMap::new(),
        }
    }

    pub fn setup_assets(&self, tokens: &Tokens) {
        self.dao
            .function_call(
                self.contract.contract.dao_update_token(Token {
                    account_id: self.roketo_token.account_id(),
                    is_listed: true,
                    commission_on_create: d(10, 18),
                    commission_coef: SafeFloat { val: 1, pow: -4 }, // 0.01%
                    collected_commission: 0,
                    storage_balance_needed: 125 * env::STORAGE_PRICE_PER_BYTE,
                    gas_for_ft_transfer: near_sdk::Gas(10 * ONE_TERA),
                    gas_for_storage_deposit: near_sdk::Gas(10 * ONE_TERA),
                }),
                DEFAULT_GAS,
                ONE_YOCTO,
            )
            .assert_success();

        self.dao
            .function_call(
                self.contract.contract.dao_update_token(Token {
                    account_id: tokens.ndai.account_id(),
                    is_listed: true,
                    commission_on_create: d(1, 18),
                    commission_coef: SafeFloat { val: 1, pow: -3 }, // 0.1%
                    collected_commission: 0,
                    storage_balance_needed: 125 * env::STORAGE_PRICE_PER_BYTE,
                    gas_for_ft_transfer: near_sdk::Gas(10 * ONE_TERA),
                    gas_for_storage_deposit: near_sdk::Gas(10 * ONE_TERA),
                }),
                DEFAULT_GAS,
                ONE_YOCTO,
            )
            .assert_success();

        self.dao
            .function_call(
                self.contract.contract.dao_update_token(Token {
                    account_id: tokens.nusdt.account_id(),
                    is_listed: true,
                    commission_on_create: d(1, 6),
                    commission_coef: SafeFloat { val: 1, pow: -3 }, // 0.1%
                    collected_commission: 0,
                    storage_balance_needed: 125 * env::STORAGE_PRICE_PER_BYTE,
                    gas_for_ft_transfer: near_sdk::Gas(10 * ONE_TERA),
                    gas_for_storage_deposit: near_sdk::Gas(10 * ONE_TERA),
                }),
                DEFAULT_GAS,
                ONE_YOCTO,
            )
            .assert_success();

        self.dao
            .function_call(
                self.contract.contract.dao_update_token(Token {
                    account_id: tokens.wnear.account_id(),
                    is_listed: true,
                    commission_on_create: d(1, 23), // 0.1 token
                    commission_coef: SafeFloat { val: 4, pow: -3 }, // 0.4%
                    collected_commission: 0,
                    storage_balance_needed: 125 * env::STORAGE_PRICE_PER_BYTE,
                    gas_for_ft_transfer: near_sdk::Gas(10 * ONE_TERA),
                    gas_for_storage_deposit: near_sdk::Gas(10 * ONE_TERA),
                }),
                DEFAULT_GAS,
                ONE_YOCTO,
            )
            .assert_success();

        self.dao
            .function_call(
                self.contract.contract.dao_update_token(Token {
                    account_id: tokens.aurora.account_id(),
                    is_listed: true,
                    commission_on_create: d(1, 15), // 0.001 token
                    commission_coef: SafeFloat { val: 4, pow: -3 }, // 0.4%
                    collected_commission: 0,
                    storage_balance_needed: 0, // aurora doesn't need storage deposit
                    gas_for_ft_transfer: near_sdk::Gas(20 * ONE_TERA),
                    gas_for_storage_deposit: near_sdk::Gas(20 * ONE_TERA),
                }),
                DEFAULT_GAS,
                ONE_YOCTO,
            )
            .assert_success();
    }

    pub fn contract_ft_transfer_call(
        &self,
        token: &UserAccount,
        user: &UserAccount,
        amount: Balance,
        msg: &str,
    ) -> ExecutionResult {
        user.call(
            token.account_id.clone(),
            "ft_transfer_call",
            &json!({
                "receiver_id": self.contract.account_id(),
                "amount": U128::from(amount),
                "msg": msg,
            })
            .to_string()
            .into_bytes(),
            MAX_GAS,
            1,
        )
    }

    pub fn mint_ft(&self, token: &UserAccount, receiver: &UserAccount, amount: Balance) {
        self.near
            .call(
                token.account_id.clone(),
                "ft_transfer",
                &json!({
                    "receiver_id": receiver.account_id(),
                    "amount": U128::from(amount),
                })
                .to_string()
                .into_bytes(),
                DEFAULT_GAS,
                1,
            )
            .assert_success();
    }

    pub fn mint_tokens(&self, tokens: &Tokens, user: &UserAccount) {
        ft_storage_deposit(user, &tokens.wnear.account_id(), &user.account_id());
        ft_storage_deposit(user, &tokens.dacha.account_id(), &user.account_id());
        ft_storage_deposit(user, &tokens.ndai.account_id(), &user.account_id());
        ft_storage_deposit(user, &tokens.nusdt.account_id(), &user.account_id());
        ft_storage_deposit(user, &tokens.aurora.account_id(), &user.account_id());
        ft_storage_deposit(user, &self.roketo_token.account_id(), &user.account_id());

        let amount = 1000000;
        self.mint_ft(&tokens.wnear, user, d(amount, 24));
        self.mint_ft(&tokens.dacha, user, d(amount, 18));
        self.mint_ft(&tokens.ndai, user, d(amount, 18));
        self.mint_ft(&tokens.nusdt, user, d(amount, 6));
        self.mint_ft(&tokens.aurora, user, d(amount, 18));
        self.mint_ft(&self.roketo_token, user, d(amount, 18));
    }

    pub fn get_balance(&self, token: &UserAccount, user: &UserAccount) -> u128 {
        u128::from(
            self.near
                .view(
                    token.account_id(),
                    "ft_balance_of",
                    &json!({
                        "account_id": user.account_id(),
                    })
                    .to_string()
                    .into_bytes(),
                )
                .unwrap_json::<U128>(),
        )
    }

    pub fn get_stats(&self) -> Stats {
        self.near
            .view(self.contract.account_id(), "get_stats", &[])
            .unwrap_json()
    }

    pub fn get_dao(&self) -> Dao {
        self.near
            .view(self.contract.account_id(), "get_dao", &[])
            .unwrap_json()
    }

    pub fn get_token(&self, token: &UserAccount) -> (Token, Option<TokenStats>) {
        self.near
            .view(
                self.contract.account_id(),
                "get_token",
                &json!({
                    "token_account_id": token.account_id(),
                })
                .to_string()
                .into_bytes(),
            )
            .unwrap_json()
    }

    pub fn get_account(&self, user: &UserAccount) -> AccountView {
        let account: Result<AccountView, ContractError> = self
            .near
            .view_method_call(self.contract.contract.get_account(user.account_id()))
            .unwrap_json();
        account.unwrap()
    }

    pub fn get_stream(&self, stream_id: &Base58CryptoHash) -> Stream {
        let stream: Result<Stream, ContractError> = self
            .near
            .view_method_call(self.contract.contract.get_stream(*stream_id))
            .unwrap_json();
        stream.unwrap()
    }

    pub fn create_stream_ext_err(
        &mut self,
        owner: &UserAccount,
        receiver: &UserAccount,
        token: &UserAccount,
        amount: Balance,
        tokens_per_sec: Balance,
        description: Option<String>,
        cliff_period_sec: Option<u32>,
        is_auto_start_enabled: Option<bool>,
        is_expirable: Option<bool>,
        is_locked: Option<bool>,
    ) -> U128 {
        self.contract_ft_transfer_call(
            &token,
            &owner,
            amount,
            &serde_json::to_string(&TransferCallRequest::Create {
                request: CreateRequest {
                    receiver_id: receiver.account_id(),
                    tokens_per_sec,
                    description,
                    cliff_period_sec,
                    is_auto_start_enabled,
                    is_expirable,
                    is_locked,
                },
            })
            .unwrap(),
        )
        .unwrap_json()
    }

    pub fn create_stream_ext(
        &mut self,
        owner: &UserAccount,
        receiver: &UserAccount,
        token: &UserAccount,
        amount: Balance,
        tokens_per_sec: Balance,
        description: Option<String>,
        cliff_period_sec: Option<u32>,
        is_auto_start_enabled: Option<bool>,
        is_expirable: Option<bool>,
        is_locked: Option<bool>,
    ) -> Base58CryptoHash {
        let res = self.contract_ft_transfer_call(
            &token,
            &owner,
            amount,
            &serde_json::to_string(&TransferCallRequest::Create {
                request: CreateRequest {
                    receiver_id: receiver.account_id(),
                    tokens_per_sec,
                    description,
                    cliff_period_sec,
                    is_auto_start_enabled,
                    is_expirable,
                    is_locked,
                },
            })
            .unwrap(),
        );
        res.assert_success();
        let amount_accepted: U128 = res.unwrap_json();
        assert_ne!(amount_accepted, U128(0));
        let stream_id = &self.get_account(&owner).last_created_stream.unwrap();
        let dao = self.get_dao();
        let token = dao.tokens.get(&token.account_id());
        let storage_balance_needed = match token {
            Some(token) => token.storage_balance_needed,
            None => DEFAULT_STORAGE_BALANCE,
        };
        self.streams
            .insert(stream_id.into(), storage_balance_needed);
        *stream_id
    }

    pub fn create_stream(
        &mut self,
        owner: &UserAccount,
        receiver: &UserAccount,
        token: &UserAccount,
        amount: Balance,
        tokens_per_sec: Balance,
    ) -> Base58CryptoHash {
        self.create_stream_ext(
            owner,
            receiver,
            token,
            amount,
            tokens_per_sec,
            None,
            None,
            None,
            None,
            None,
        )
    }

    pub fn start_stream_err(
        &self,
        user: &UserAccount,
        stream_id: &Base58CryptoHash,
    ) -> ExecutionResult {
        user.function_call(
            self.contract.contract.start_stream(*stream_id),
            MAX_GAS,
            ONE_YOCTO,
        )
    }

    pub fn pause_stream_err(
        &self,
        user: &UserAccount,
        stream_id: &Base58CryptoHash,
    ) -> ExecutionResult {
        user.function_call(
            self.contract.contract.pause_stream(*stream_id),
            MAX_GAS,
            ONE_YOCTO + self.streams.get(&String::from(stream_id)).unwrap(),
        )
    }

    pub fn stop_stream_err(
        &self,
        user: &UserAccount,
        stream_id: &Base58CryptoHash,
    ) -> ExecutionResult {
        user.function_call(
            self.contract.contract.stop_stream(*stream_id),
            MAX_GAS,
            ONE_YOCTO + 2 * self.streams.get(&String::from(stream_id)).unwrap(),
        )
    }

    pub fn withdraw_err(
        &self,
        user: &UserAccount,
        stream_id: &Base58CryptoHash,
    ) -> ExecutionResult {
        user.function_call(
            self.contract
                .contract
                .withdraw(vec![*stream_id], Some(true)),
            MAX_GAS,
            ONE_YOCTO + self.streams.get(&String::from(stream_id)).unwrap(),
        )
    }

    pub fn withdraw_ext_err(
        &self,
        user: &UserAccount,
        stream_ids: &[&Base58CryptoHash],
    ) -> ExecutionResult {
        user.function_call(
            self.contract.contract.withdraw(
                stream_ids.iter().map(|&x| (*x).into()).collect(),
                Some(true),
            ),
            MAX_GAS,
            ONE_YOCTO
                + stream_ids
                    .iter()
                    .map(|&x| self.streams.get(&String::from(x)).unwrap())
                    .sum::<Balance>(),
        )
    }

    pub fn deposit_err(
        &mut self,
        user: &UserAccount,
        stream_id: &Base58CryptoHash,
        token: &UserAccount,
        amount: Balance,
    ) -> U128 {
        self.contract_ft_transfer_call(
            &token,
            &user,
            amount,
            &serde_json::to_string(&TransferCallRequest::Deposit {
                stream_id: *stream_id,
            })
            .unwrap(),
        )
        .unwrap_json()
    }

    pub fn start_stream(&self, user: &UserAccount, stream_id: &Base58CryptoHash) {
        assert!(self.start_stream_err(user, stream_id).is_ok());
    }

    pub fn pause_stream(&self, user: &UserAccount, stream_id: &Base58CryptoHash) {
        assert!(self.pause_stream_err(user, stream_id).is_ok());
    }

    pub fn stop_stream(&self, user: &UserAccount, stream_id: &Base58CryptoHash) {
        assert!(self.stop_stream_err(user, stream_id).is_ok());
    }

    pub fn withdraw(&self, user: &UserAccount, stream_id: &Base58CryptoHash) {
        assert!(self.withdraw_err(user, stream_id).is_ok());
    }

    pub fn account_deposit_near(&self, user: &UserAccount, amount: Balance) {
        user.function_call(
            self.contract.contract.account_deposit_near(),
            MAX_GAS,
            amount,
        )
        .assert_success();
    }

    pub fn account_update_cron_flag(&self, user: &UserAccount, flag: bool) {
        user.function_call(
            self.contract.contract.account_update_cron_flag(flag),
            MAX_GAS,
            ONE_YOCTO,
        )
        .assert_success();
    }

    pub fn dao_update_token(&self, token: Token) {
        self.dao
            .function_call(
                self.contract.contract.dao_update_token(token),
                MAX_GAS,
                ONE_YOCTO,
            )
            .assert_success();
    }

    pub fn skip_time(&self, seconds: u64) {
        self.near.borrow_runtime_mut().cur_block.block_timestamp += to_nano(seconds);
    }

    #[allow(dead_code)]
    pub fn show_balances(&self, users: &Users, tokens: &Tokens) {
        for user in [
            &users.alice,
            &users.bob,
            &users.charlie,
            &users.dude,
            &users.eve,
            &self.near,
            &self.dao,
            &self.contract.user_account,
        ] {
            for token in [
                &tokens.wnear,
                &tokens.dacha,
                &tokens.ndai,
                &tokens.nusdt,
                &tokens.aurora,
                &self.roketo_token,
            ] {
                println!(
                    "{:?}, {:?}: {:?}",
                    user.account_id().to_string(),
                    token.account_id().to_string(),
                    self.get_balance(&token, &user)
                )
            }
        }
    }
}

pub fn init_token(e: &Env, token_account_id: &str, decimals: u8) -> UserAccount {
    if token_account_id != "aurora" {
        let token_account_id: AccountId = token_account_id.parse().unwrap();
        let token = e.near.deploy_and_init(
            &FUNGIBLE_TOKEN_WASM_BYTES,
            token_account_id.clone(),
            "new",
            &json!({
                "owner_id": e.near.account_id(),
                "total_supply": U128::from(10u128.pow((10 + decimals) as _)),
                "metadata": FungibleTokenMetadata {
                    spec: FT_METADATA_SPEC.to_string(),
                    name: token_account_id.to_string(),
                    symbol: token_account_id.to_string(),
                    icon: None,
                    reference: None,
                    reference_hash: None,
                    decimals: decimals,
                }
            })
            .to_string()
            .into_bytes(),
            to_yocto("10"),
            DEFAULT_GAS,
        );

        ft_storage_deposit(&e.near, &token_account_id, &e.contract.account_id());
        token
    } else {
        // TODO deploy and init aurora contract
        // use AURORA_WASM_BYTES
        let token_account_id = AccountId::new_unchecked(token_account_id.to_string());
        let token = e.near.deploy_and_init(
            &FUNGIBLE_TOKEN_WASM_BYTES,
            token_account_id.clone(),
            "new",
            &json!({
                "owner_id": e.near.account_id(),
                "total_supply": U128::from(10u128.pow((10 + decimals) as _)),
                "metadata": FungibleTokenMetadata {
                    spec: FT_METADATA_SPEC.to_string(),
                    name: token_account_id.to_string(),
                    symbol: token_account_id.to_string(),
                    icon: None,
                    reference: None,
                    reference_hash: None,
                    decimals: decimals,
                }
            })
            .to_string()
            .into_bytes(),
            to_yocto("10"),
            DEFAULT_GAS,
        );

        ft_storage_deposit(&e.near, &token_account_id, &e.contract.account_id());
        token
    }
}

impl Tokens {
    pub fn init(e: &Env) -> Self {
        Self {
            wnear: init_token(e, "wrap.near", 24),
            dacha: init_token(e, "dacha.near", 18),
            ndai: init_token(e, "dai.near", 18),
            nusdt: init_token(e, "nusdt.near", 6),
            aurora: init_token(e, "aurora", 18),
        }
    }
}

impl Users {
    pub fn init(e: &Env) -> Self {
        Self {
            alice: e
                .near
                .create_user("alice.near".parse().unwrap(), to_yocto("10000")),
            bob: e
                .near
                .create_user("bob.near".parse().unwrap(), to_yocto("10000")),
            charlie: e
                .near
                .create_user("charlie.near".parse().unwrap(), to_yocto("10000")),
            dude: e
                .near
                .create_user("dude.near".parse().unwrap(), to_yocto("10000")),
            eve: e
                .near
                .create_user("eve.near".parse().unwrap(), to_yocto("10000")),
        }
    }
}

pub fn d(value: Balance, decimals: u8) -> Balance {
    value * 10u128.pow(decimals as _)
}

// TODO check balances integrity
