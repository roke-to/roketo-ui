use crate::*;

#[derive(Deserialize, Serialize)]
#[cfg_attr(not(target_arch = "wasm32"), derive(Debug))]
#[serde(crate = "near_sdk::serde")]
pub struct AccountView {
    pub active_streams: u32,
    pub inactive_streams: u32,

    pub total_incoming: HashMap<AccountId, U128>,
    pub total_outgoing: HashMap<AccountId, U128>,
    pub total_received: HashMap<AccountId, U128>,

    pub deposit: U128,

    pub last_created_stream: Option<Base58CryptoHash>,
    pub is_cron_allowed: bool,
}

#[near_bindgen]
impl Contract {
    pub fn get_stats(self) -> Stats {
        let mut stats: Stats = self.stats.get().unwrap().into();
        stats.total_listed_tokens = stats.listed_tokens.len() as u32;
        stats
    }

    pub fn get_dao(self) -> Dao {
        self.dao
    }

    pub fn get_token(self, token_account_id: AccountId) -> (Token, Option<TokenStats>) {
        (
            self.dao
                .get_token(&token_account_id)
                .unwrap_or(Token::new_unlisted(&token_account_id)),
            (Stats::from(self.stats.get().unwrap()))
                .listed_tokens
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
                    active_streams: v.active_streams.len() as u32,
                    inactive_streams: v.inactive_streams.len() as u32,

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

                    deposit: v.deposit.into(),
                    last_created_stream: v.last_created_stream.map(|w| w.into()),
                    is_cron_allowed: v.is_cron_allowed,
                })
            })
            .unwrap_or(Err(ContractError::UnreachableAccount { account_id }))
    }

    pub fn get_account_active_streams(
        &self,
        account_id: AccountId,
        from: u32,
        limit: u32,
    ) -> Result<Vec<Stream>, ContractError> {
        self.accounts
            .get(&account_id)
            .map(|v| v.into())
            .map(|v: Account| {
                Ok(
                    (from..std::cmp::min(v.active_streams.len() as u32, from + limit))
                        .map(|i| {
                            self.streams
                                .get(&v.active_streams.as_vector().get(i.into()).unwrap())
                                .unwrap()
                                .into()
                        })
                        .collect(),
                )
            })
            .unwrap_or(Err(ContractError::UnreachableAccount { account_id }))
    }

    pub fn get_account_inactive_streams(
        &self,
        account_id: AccountId,
        from: u32,
        limit: u32,
    ) -> Result<Vec<Stream>, ContractError> {
        self.accounts
            .get(&account_id)
            .map(|v| v.into())
            .map(|v: Account| {
                Ok(
                    (from..std::cmp::min(v.inactive_streams.len() as u32, from + limit))
                        .map(|i| {
                            self.streams
                                .get(&v.inactive_streams.as_vector().get(i.into()).unwrap())
                                .unwrap()
                                .into()
                        })
                        .collect(),
                )
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
