use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default)]
#[cfg_attr(not(target_arch = "wasm32"), derive(Debug))]
#[serde(crate = "near_sdk::serde")]
pub struct TokenStats {
    #[serde(with = "u128_dec_format")]
    pub total_deposit: Balance,
    #[serde(with = "u128_dec_format")]
    pub tvl: Balance,
    #[serde(with = "u128_dec_format")]
    pub transferred: Balance,
    #[serde(with = "u128_dec_format")]
    pub refunded: Balance,
    #[serde(with = "u128_dec_format")]
    pub total_commission_collected: Balance,

    #[serde(with = "u128_dec_format")]
    pub streams: u128,
    #[serde(with = "u128_dec_format")]
    pub active_streams: u128,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default)]
#[cfg_attr(not(target_arch = "wasm32"), derive(Debug))]
#[serde(crate = "near_sdk::serde")]
pub struct Stats {
    pub listed_tokens: HashMap<AccountId, TokenStats>,

    #[serde(with = "u128_dec_format")]
    pub total_accounts: u128,
    #[serde(with = "u128_dec_format")]
    pub total_streams: u128,
    #[serde(with = "u128_dec_format")]
    pub total_active_streams: u128,

    #[borsh_skip]
    pub total_listed_tokens: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum VStats {
    Current(Stats),
}

impl From<VStats> for Stats {
    fn from(v: VStats) -> Self {
        match v {
            VStats::Current(c) => c,
        }
    }
}

impl From<Stats> for VStats {
    fn from(c: Stats) -> Self {
        VStats::Current(c)
    }
}

impl Contract {
    pub(crate) fn stats_add_token(&mut self, token_account_id: AccountId) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        assert!(stats
            .listed_tokens
            .insert(token_account_id, TokenStats::default())
            .is_none());
        self.stats.set(&stats.into());
        //assert!(false);
    }

    pub(crate) fn stats_inc_accounts(&mut self) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats.total_accounts += 1;
        self.stats.set(&stats.into());
    }

    pub(crate) fn stats_inc_streams(&mut self, token_account_id: AccountId) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats.total_streams += 1;
        (*stats
            .listed_tokens
            .entry(token_account_id)
            .or_insert(TokenStats::default()))
        .streams += 1;
        self.stats.set(&stats.into());
    }

    pub(crate) fn stats_inc_active_streams(&mut self, token_account_id: AccountId) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats.total_active_streams += 1;
        (*stats
            .listed_tokens
            .entry(token_account_id)
            .or_insert(TokenStats::default()))
        .active_streams += 1;
        self.stats.set(&stats.into());
    }

    pub(crate) fn stats_inc_deposit(&mut self, token_account_id: AccountId, deposit: Balance) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        let entry = stats
            .listed_tokens
            .entry(token_account_id)
            .or_insert(TokenStats::default());
        (*entry).total_deposit += deposit;
        (*entry).tvl += deposit;
        self.stats.set(&stats.into());
    }

    // TODO enable other stats methods
    // TODO write tests that fills stats properly
}
