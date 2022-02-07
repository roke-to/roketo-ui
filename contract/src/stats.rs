use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default, Clone)]
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

    #[serde(with = "u64_dec_format")]
    pub last_update_time: Timestamp,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default, Clone)]
#[cfg_attr(not(target_arch = "wasm32"), derive(Debug))]
#[serde(crate = "near_sdk::serde")]
pub struct Stats {
    pub dao_tokens: HashMap<AccountId, TokenStats>,

    #[borsh_skip]
    pub total_accounts: u32,
    #[borsh_skip]
    pub total_streams: u32,
    #[borsh_skip]
    pub total_dao_tokens: u32,

    pub total_active_streams: u32,
    pub total_aurora_streams: u32,
    pub total_streams_unlisted: u32,

    #[serde(with = "u128_dec_format")]
    pub total_account_deposit_near: Balance,
    #[serde(with = "u128_dec_format")]
    pub total_account_deposit_eth: Balance,

    #[serde(with = "u64_dec_format")]
    pub last_update_time: Timestamp,
}

#[derive(BorshSerialize, BorshDeserialize, Clone)]
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
            .dao_tokens
            .insert(token_account_id.clone(), TokenStats::default())
            .is_none());
        stats.last_update_time = env::block_timestamp();
        self.stats.set(Some(stats.into()));
    }

    pub(crate) fn stats_inc_streams(
        &mut self,
        token_account_id: &AccountId,
        is_aurora: bool,
        is_listed: bool,
    ) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        if is_aurora {
            stats.total_aurora_streams += 1;
        }
        if !is_listed {
            stats.total_streams_unlisted += 1;
        }
        stats
            .dao_tokens
            .entry(token_account_id.clone())
            .and_modify(|e| {
                e.streams += 1;
                e.last_update_time = env::block_timestamp();
            });
        stats.last_update_time = env::block_timestamp();
        self.stats.set(Some(stats.into()));
    }

    pub(crate) fn stats_inc_active_streams(&mut self, token_account_id: &AccountId) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats.total_active_streams += 1;
        stats
            .dao_tokens
            .entry(token_account_id.clone())
            .and_modify(|e| {
                e.active_streams += 1;
                e.last_update_time = env::block_timestamp()
            });
        stats.last_update_time = env::block_timestamp();
        self.stats.set(Some(stats.into()));
    }

    pub(crate) fn stats_dec_active_streams(&mut self, token_account_id: &AccountId) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats.total_active_streams -= 1;
        stats
            .dao_tokens
            .entry(token_account_id.clone())
            .and_modify(|e| {
                e.active_streams -= 1;
                e.last_update_time = env::block_timestamp()
            });
        stats.last_update_time = env::block_timestamp();
        self.stats.set(Some(stats.into()));
    }

    pub(crate) fn stats_inc_stream_deposit(
        &mut self,
        token_account_id: &AccountId,
        deposit: &Balance,
        tvl_inc: &Balance,
    ) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats
            .dao_tokens
            .entry(token_account_id.clone())
            .and_modify(|e| {
                e.total_deposit += deposit;
                e.tvl += tvl_inc;
                e.total_commission_collected += deposit - tvl_inc;
                e.last_update_time = env::block_timestamp();
            });
        stats.last_update_time = env::block_timestamp();
        self.stats.set(Some(stats.into()));
    }

    pub(crate) fn stats_withdraw(&mut self, token: &Token, payment: Balance, commission: Balance) {
        if !token.is_listed {
            return;
        }
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats
            .dao_tokens
            .entry(token.account_id.clone())
            .and_modify(|e| {
                e.tvl -= payment + commission;
                e.transferred += payment;
                e.total_commission_collected += commission;
                e.last_update_time = env::block_timestamp();
            });
        stats.last_update_time = env::block_timestamp();
        self.stats.set(Some(stats.into()));
    }

    pub(crate) fn stats_refund(&mut self, token: &Token, refund: Balance) {
        if !token.is_listed {
            return;
        }
        let mut stats: Stats = self.stats.take().unwrap().into();
        stats
            .dao_tokens
            .entry(token.account_id.clone())
            .and_modify(|e| {
                e.tvl -= refund;
                e.refunded += refund;
                e.last_update_time = env::block_timestamp();
            });
        stats.last_update_time = env::block_timestamp();
        self.stats.set(Some(stats.into()));
    }

    pub(crate) fn stats_inc_account_deposit(&mut self, deposit: &Balance, is_aurora: bool) {
        let mut stats: Stats = self.stats.take().unwrap().into();
        if is_aurora {
            stats.total_account_deposit_eth += deposit;
        } else {
            stats.total_account_deposit_near += deposit;
        }
        stats.last_update_time = env::block_timestamp();
        self.stats.set(Some(stats.into()));
    }
}
