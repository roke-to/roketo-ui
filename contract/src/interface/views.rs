use crate::*;

#[derive(Deserialize, Serialize)]
#[cfg_attr(not(target_arch = "wasm32"), derive(Debug))]
#[serde(crate = "near_sdk::serde")]
pub struct AccountView {
    pub active_incoming_streams: u32,
    pub active_outgoing_streams: u32,
    pub inactive_incoming_streams: u32,
    pub inactive_outgoing_streams: u32,

    pub total_incoming: HashMap<AccountId, U128>,
    pub total_outgoing: HashMap<AccountId, U128>,
    pub total_received: HashMap<AccountId, U128>,

    #[serde(with = "u128_dec_format")]
    pub deposit: Balance,

    #[serde(with = "u128_dec_format")]
    pub stake: Balance,

    pub last_created_stream: Option<Base58CryptoHash>,
    pub is_cron_allowed: bool,
}

#[near_bindgen]
impl Contract {
    pub fn get_stats(self) -> Stats {
        let mut stats: Stats = self.stats.get().clone().unwrap().into();
        stats.total_dao_tokens = stats.dao_tokens.len() as _;
        stats.total_accounts = self.accounts.len() as _;
        stats.total_streams = self.streams.len() as _;
        stats
    }

    pub fn get_dao(self) -> Dao {
        self.dao
    }

    pub fn get_token(self, token_account_id: AccountId) -> (Token, Option<TokenStats>) {
        (
            self.dao.get_token_or_unlisted(&token_account_id),
            (Stats::from(self.stats.get().clone().unwrap()))
                .dao_tokens
                .remove(&token_account_id),
        )
    }

    pub fn get_stream(&self, stream_id: Base58CryptoHash) -> Result<Stream, ContractError> {
        let stream_id = stream_id.into();
        self.streams
            .get(&stream_id)
            .map(|v| Ok(v.into()))
            .unwrap_or(Err(ContractError::UnreachableStream { stream_id }))
    }

    pub fn get_account(&self, account_id: AccountId) -> Result<AccountView, ContractError> {
        self.accounts
            .get(&account_id)
            .map(|v| v.into())
            .map(|v: Account| {
                Ok(AccountView {
                    active_incoming_streams: v.active_incoming_streams.len() as _,
                    active_outgoing_streams: v.active_outgoing_streams.len() as _,
                    inactive_incoming_streams: v.inactive_incoming_streams.len() as _,
                    inactive_outgoing_streams: v.inactive_outgoing_streams.len() as _,

                    total_incoming: self
                        .dao
                        .tokens
                        .iter()
                        .map(|(k, _)| (k.clone(), U128(*v.total_incoming.get(k).unwrap_or(&0))))
                        .collect(),
                    total_outgoing: self
                        .dao
                        .tokens
                        .iter()
                        .map(|(k, _)| (k.clone(), U128(*v.total_outgoing.get(k).unwrap_or(&0))))
                        .collect(),
                    total_received: self
                        .dao
                        .tokens
                        .iter()
                        .map(|(k, _)| (k.clone(), U128(*v.total_received.get(k).unwrap_or(&0))))
                        .collect(),

                    deposit: v.deposit,
                    stake: v.stake,
                    last_created_stream: v.last_created_stream.map(|w| w.into()),
                    is_cron_allowed: v.is_cron_allowed,
                })
            })
            .unwrap_or(Err(ContractError::UnreachableAccount { account_id }))
    }

    pub fn get_account_incoming_streams(
        &self,
        account_id: AccountId,
        from: u32,
        limit: u32,
    ) -> Result<Vec<Stream>, ContractError> {
        self.accounts
            .get(&account_id)
            .map(|v| v.into())
            .map(|v: Account| {
                Ok(self.collect_account_data(
                    &v.active_incoming_streams,
                    &v.inactive_incoming_streams,
                    from,
                    limit,
                ))
            })
            .unwrap_or(Err(ContractError::UnreachableAccount { account_id }))
    }

    pub fn get_account_outgoing_streams(
        &self,
        account_id: AccountId,
        from: u32,
        limit: u32,
    ) -> Result<Vec<Stream>, ContractError> {
        self.accounts
            .get(&account_id)
            .map(|v| v.into())
            .map(|v: Account| {
                Ok(self.collect_account_data(
                    &v.active_outgoing_streams,
                    &v.inactive_outgoing_streams,
                    from,
                    limit,
                ))
            })
            .unwrap_or(Err(ContractError::UnreachableAccount { account_id }))
    }

    pub fn get_account_ft(
        &self,
        account_id: AccountId,
        token_account_id: AccountId,
    ) -> Result<(U128, U128, U128), ContractError> {
        self.accounts
            .get(&account_id)
            .map(|v| v.into())
            .map(|v: Account| {
                Ok((
                    (*v.total_incoming.get(&token_account_id).unwrap_or(&0)).into(),
                    (*v.total_outgoing.get(&token_account_id).unwrap_or(&0)).into(),
                    (*v.total_received.get(&token_account_id).unwrap_or(&0)).into(),
                ))
            })
            .unwrap_or(Err(ContractError::UnreachableAccount { account_id }))
    }
}

impl Contract {
    fn collect_account_data(
        &self,
        active_streams: &UnorderedSet<StreamId>,
        inactive_streams: &UnorderedSet<StreamId>,
        from: u32,
        limit: u32,
    ) -> Vec<Stream> {
        (from..std::cmp::min(active_streams.len() as _, from + limit))
            .map(|i| {
                self.streams
                    .get(&active_streams.as_vector().get(i as _).unwrap())
                    .unwrap()
                    .into()
            })
            .chain(
                (from..std::cmp::min(inactive_streams.len() as _, from + limit)).map(|i| {
                    self.streams
                        .get(&inactive_streams.as_vector().get(i as _).unwrap())
                        .unwrap()
                        .into()
                }),
            )
            .collect()
    }
}
