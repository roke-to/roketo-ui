use near_contract_standards::fungible_token::metadata::{FungibleTokenMetadata, FT_METADATA_SPEC};
use near_sdk::json_types::{Base58CryptoHash, U128};
use near_sdk::serde_json::json;
use near_sdk::{env, serde_json, AccountId, Balance, Timestamp, ONE_YOCTO};
use near_sdk_sim::runtime::GenesisConfig;
use near_sdk_sim::{
    deploy, init_simulator, to_yocto, ContractAccount, ExecutionResult, UserAccount,
};

use contract::ContractContract as RoketoContract;
use contract::{
    AccountView, ContractError, CreateRequest, Dao, Stats, Stream, Token, TokenStats,
    TransferCallRequest, DEFAULT_GAS_FOR_FT_TRANSFER, DEFAULT_GAS_FOR_STORAGE_DEPOSIT,
};

near_sdk_sim::lazy_static_include::lazy_static_include_bytes! {
    ROKETO_WASM_BYTES => "res/roketo.wasm",
    FUNGIBLE_TOKEN_WASM_BYTES => "res/fungible_token.wasm",
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

        let contract = deploy!(
            contract: RoketoContract,
            contract_id: ROKETO_ID.to_string(),
            bytes: &ROKETO_WASM_BYTES,
            signer_account: near,
            deposit: to_yocto("20"),
            gas: DEFAULT_GAS,
            init_method: new(
                dao_id
                // roketo_token_ud: ROKETO_TOKEN_ID.to_string(),
                // roketo_token_decimals: ROKETO_TOKEN_DECIMALS,
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
        }
    }

    pub fn setup_assets(&self, tokens: &Tokens) {
        self.dao
            .function_call(
                self.contract.contract.dao_update_token(Token {
                    account_id: self.roketo_token.account_id(),
                    is_listed: false, // unused
                    commission_on_create: d(10, 18),
                    commission_numerator: 1,
                    commission_denominator: 10000, // 0.01%
                    collected_commission: 0,
                    storage_balance_needed: 125 * env::STORAGE_PRICE_PER_BYTE,
                    gas_for_ft_transfer: DEFAULT_GAS_FOR_FT_TRANSFER,
                    gas_for_storage_deposit: DEFAULT_GAS_FOR_STORAGE_DEPOSIT,
                }),
                DEFAULT_GAS,
                ONE_YOCTO,
            )
            .assert_success();

        self.dao
            .function_call(
                self.contract.contract.dao_update_token(Token {
                    account_id: tokens.ndai.account_id(),
                    is_listed: false, // unused
                    commission_on_create: d(1, 18),
                    commission_numerator: 1,
                    commission_denominator: 1000, // 0.1%
                    collected_commission: 0,
                    storage_balance_needed: 125 * env::STORAGE_PRICE_PER_BYTE,
                    gas_for_ft_transfer: DEFAULT_GAS_FOR_FT_TRANSFER,
                    gas_for_storage_deposit: DEFAULT_GAS_FOR_STORAGE_DEPOSIT,
                }),
                DEFAULT_GAS,
                ONE_YOCTO,
            )
            .assert_success();

        self.dao
            .function_call(
                self.contract.contract.dao_update_token(Token {
                    account_id: tokens.nusdt.account_id(),
                    is_listed: false, // unused
                    commission_on_create: d(1, 6),
                    commission_numerator: 1,
                    commission_denominator: 1000, // 0.1%
                    collected_commission: 0,
                    storage_balance_needed: 125 * env::STORAGE_PRICE_PER_BYTE,
                    gas_for_ft_transfer: DEFAULT_GAS_FOR_FT_TRANSFER,
                    gas_for_storage_deposit: DEFAULT_GAS_FOR_STORAGE_DEPOSIT,
                }),
                DEFAULT_GAS,
                ONE_YOCTO,
            )
            .assert_success();

        self.dao
            .function_call(
                self.contract.contract.dao_update_token(Token {
                    account_id: tokens.wnear.account_id(),
                    is_listed: false,               // unused
                    commission_on_create: d(1, 23), // 0.1 token
                    commission_numerator: 1,
                    commission_denominator: 250, // 0.4%
                    collected_commission: 0,
                    storage_balance_needed: 125 * env::STORAGE_PRICE_PER_BYTE,
                    gas_for_ft_transfer: DEFAULT_GAS_FOR_FT_TRANSFER,
                    gas_for_storage_deposit: DEFAULT_GAS_FOR_STORAGE_DEPOSIT,
                }),
                DEFAULT_GAS,
                ONE_YOCTO,
            )
            .assert_success();

        self.dao
            .function_call(
                self.contract.contract.dao_update_token(Token {
                    account_id: tokens.aurora.account_id(),
                    is_listed: false,               // unused
                    commission_on_create: d(1, 15), // 0.001 token
                    commission_numerator: 1,
                    commission_denominator: 250, // 0.4%
                    collected_commission: 0,
                    storage_balance_needed: 0, // aurora doesn't need storage deposit
                    gas_for_ft_transfer: DEFAULT_GAS_FOR_FT_TRANSFER,
                    gas_for_storage_deposit: DEFAULT_GAS_FOR_STORAGE_DEPOSIT,
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

    pub fn get_balance(&self, token: &UserAccount, user: &UserAccount) -> U128 {
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
            .unwrap_json()
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

    pub fn create_stream(
        &self,
        owner: &UserAccount,
        receiver: &UserAccount,
        token: &UserAccount,
        amount: Balance,
        period_sec: u64,
    ) {
        self.contract_ft_transfer_call(
            &token,
            &owner,
            amount,
            &serde_json::to_string(&TransferCallRequest::Create {
                request: CreateRequest {
                    receiver_id: receiver.account_id(),
                    tokens_per_sec: amount / period_sec as u128,
                    description: None,
                    is_auto_start_enabled: None,
                    is_expirable: None,
                },
            })
            .unwrap(),
        )
        .assert_success();
    }

    pub fn stop_stream(
        &self,
        user: &UserAccount,
        stream_id: &Base58CryptoHash,
    ) -> Result<(), ContractError> {
        let res = user.function_call(
            self.contract.contract.stop_stream(*stream_id),
            MAX_GAS,
            ONE_YOCTO,
        );
        res.assert_success();
        //println!("### {:?}", res);
        let res = match &(res.outcome()).status {
            near_sdk_sim::transaction::ExecutionStatus::SuccessValue(s) => {
                near_sdk::serde_json::from_slice(&s)
            }
            _ => unreachable!(),
        };
        //println!("### {:?}", res);
        if res.is_err() {
            return Ok(());
        }
        near_sdk::serde_json::from_value(res.unwrap()).unwrap()
    }

    /*pub fn get_asset(&self, token: &UserAccount) -> AssetDetailedView {
        let asset: Option<AssetDetailedView> = self
            .near
            .view_method_call(self.contract.contract.get_asset(token.valid_account_id()))
            .unwrap_json();
        asset.unwrap()
    }

    pub fn get_account(&self, user: &UserAccount) -> AccountDetailedView {
        let asset: Option<AccountDetailedView> = self
            .near
            .view_method_call(self.contract.contract.get_account(user.valid_account_id()))
            .unwrap_json();
        asset.unwrap()
    }

    pub fn supply_to_collateral(
        &self,
        user: &UserAccount,
        token: &UserAccount,
        amount: Balance,
    ) -> ExecutionResult {
        self.contract_ft_transfer_call(
            &token,
            &user,
            amount,
            &serde_json::to_string(&TokenReceiverMsg::Execute {
                actions: vec![Action::IncreaseCollateral(AssetAmount {
                    token_id: token.account_id(),
                    amount: None,
                    max_amount: None,
                })],
            })
            .unwrap(),
        )
    }

    pub fn oracle_call(
        &self,
        user: &UserAccount,
        price_data: PriceData,
        msg: PriceReceiverMsg,
    ) -> ExecutionResult {
        user.function_call(
            self.oracle.contract.oracle_call(
                self.contract.user_account.valid_account_id(),
                price_data,
                serde_json::to_string(&msg).unwrap(),
            ),
            MAX_GAS,
            ONE_YOCTO,
        )
    }

    pub fn borrow(
        &self,
        user: &UserAccount,
        token: &UserAccount,
        price_data: PriceData,
        amount: Balance,
    ) -> ExecutionResult {
        self.oracle_call(
            &user,
            price_data,
            PriceReceiverMsg::Execute {
                actions: vec![Action::Borrow(AssetAmount {
                    token_id: token.account_id(),
                    amount: Some(amount.into()),
                    max_amount: None,
                })],
            },
        )
    }

    pub fn borrow_and_withdraw(
        &self,
        user: &UserAccount,
        token: &UserAccount,
        price_data: PriceData,
        amount: Balance,
    ) -> ExecutionResult {
        self.oracle_call(
            &user,
            price_data,
            PriceReceiverMsg::Execute {
                actions: vec![
                    Action::Borrow(AssetAmount {
                        token_id: token.account_id(),
                        amount: Some(amount.into()),
                        max_amount: None,
                    }),
                    Action::Withdraw(AssetAmount {
                        token_id: token.account_id(),
                        amount: Some(amount.into()),
                        max_amount: None,
                    }),
                ],
            },
        )
    }*/

    pub fn skip_time(&self, seconds: u64) {
        self.near.borrow_runtime_mut().cur_block.block_timestamp += to_nano(seconds);
    }

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
    let token_account_id = AccountId::new_unchecked(token_account_id.to_string());
    let token = e.near.deploy_and_init(
        &FUNGIBLE_TOKEN_WASM_BYTES,
        token_account_id.clone(),
        "new",
        &json!({
            "owner_id": e.near.account_id(),
            "total_supply": U128::from(10u128.pow((9 + decimals) as _)),
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
