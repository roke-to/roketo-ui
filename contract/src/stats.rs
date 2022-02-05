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

    pub streams: u32,
    pub active_streams: u32,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default)]
#[cfg_attr(not(target_arch = "wasm32"), derive(Debug))]
#[serde(crate = "near_sdk::serde")]
pub struct Stats {
    pub listed_tokens: HashMap<AccountId, TokenStats>,

    pub total_accounts: u32,
    pub total_aurora_accounts: u32,

    pub total_streams: u32,
    pub total_active_streams: u32,
    pub total_aurora_streams: u32,

    #[borsh_skip]
    pub total_listed_tokens: u32,

    #[serde(with = "u128_dec_format")]
    pub total_account_deposit_near: Balance,
    #[serde(with = "u128_dec_format")]
    pub total_account_deposit_eth: Balance,
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
    pub(crate) fn stats_add_token(&mut self, token_account_id: &AccountId) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        assert!(stats
            .listed_tokens
            .insert(token_account_id.clone(), TokenStats::default())
            .is_none());
        self.stats.set(&stats.into());
    }

    pub(crate) fn stats_inc_accounts(&mut self, is_aurora: bool) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats.total_accounts += 1;
        if is_aurora {
            stats.total_aurora_accounts += 1;
        }
        self.stats.set(&stats.into());
    }

    pub(crate) fn stats_inc_streams(
        &mut self,
        token_account_id: &AccountId,
        is_active: bool,
        is_aurora: bool,
    ) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats.total_streams += 1;
        if is_active {
            stats.total_active_streams += 1;
        }
        if is_aurora {
            stats.total_aurora_streams += 1;
        }

        if self.dao.is_token_listed(token_account_id) {
            stats
                .listed_tokens
                .entry(token_account_id.clone())
                .and_modify(|e| {
                    e.streams += 1;
                    if is_active {
                        e.active_streams += 1;
                    }
                });
        }
        self.stats.set(&stats.into());
    }

    pub(crate) fn stats_inc_active_streams(&mut self, token_account_id: &AccountId) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats.total_active_streams += 1;
        (*stats
            .listed_tokens
            .entry(token_account_id.clone())
            .or_default())
        .active_streams += 1;
        self.stats.set(&stats.into());
    }

    pub(crate) fn stats_dec_active_streams(&mut self, token_account_id: &AccountId) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats.total_active_streams -= 1;
        (*stats
            .listed_tokens
            .entry(token_account_id.clone())
            .or_default())
        .active_streams -= 1;
        self.stats.set(&stats.into());
    }

    pub(crate) fn stats_inc_stream_deposit(
        &mut self,
        token_account_id: &AccountId,
        deposit: &Balance,
    ) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        let entry = stats
            .listed_tokens
            .entry(token_account_id.clone())
            .or_default();
        (*entry).total_deposit += deposit;
        (*entry).tvl += deposit;
        self.stats.set(&stats.into());
    }

    // TODO enable other stats methods
    //
    // stats_withdraw
    // stats_refund
    // stats_inc_commission_collected

    pub(crate) fn stats_inc_account_deposit(&mut self, deposit: &Balance, is_aurora: bool) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        if is_aurora {
            stats.total_account_deposit_eth += deposit;
        } else {
            stats.total_account_deposit_near += deposit;
        }
        self.stats.set(&stats.into());
    }
}
