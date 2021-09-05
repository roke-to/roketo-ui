use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Stream {
    pub description: Option<String>,
    pub owner_id: AccountId,
    pub receiver_id: AccountId,
    pub token_id: TokenId,
    pub timestamp_created: Timestamp,
    pub balance: Balance,
    pub tokens_per_tick: Balance,
    pub auto_deposit_enabled: bool,
    pub status: StreamStatus,
    //pub history: Vector<Action>,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct StreamView {
    pub stream_id: Option<Base58CryptoHash>,
    pub description: Option<String>,
    pub owner_id: String,
    pub receiver_id: String,
    pub token_name: String,
    pub timestamp_created: WrappedTimestamp,
    pub balance: WrappedBalance,
    pub tokens_per_tick: WrappedBalance,
    pub auto_deposit_enabled: bool,
    pub status: String,
    //pub history: Vec<Action>,
    pub available_to_withdraw: WrappedBalance,
}

impl From<&Stream> for StreamView {
    fn from(s: &Stream) -> Self {
        Self {
            stream_id: None,
            description: s.description.clone(),
            owner_id: s.owner_id.clone(),
            receiver_id: s.receiver_id.clone(),
            token_name: Xyiming::get_token_name_by_id(s.token_id),
            timestamp_created: s.timestamp_created.into(),
            balance: s.balance.into(),
            tokens_per_tick: s.tokens_per_tick.into(),
            auto_deposit_enabled: s.auto_deposit_enabled,
            status: s.status.to_string(),
            available_to_withdraw: s.get_amount_since_last_action(Xyiming::accounts().get(&s.receiver_id).unwrap().last_action).into(),
        }
    }
}

impl Stream {
    pub(crate) fn new(
        description: Option<String>,
        owner_id: AccountId,
        receiver_id: AccountId,
        token_id: TokenId,
        initial_balance: Balance,
        tokens_per_tick: Balance,
        auto_deposit_enabled: bool,
    ) -> StreamId {
        let stream_id = env::sha256(&env::block_index().to_be_bytes())
            .as_slice()
            .try_into()
            .unwrap();
        Xyiming::streams().insert(
            &stream_id,
            &Self {
                description,
                owner_id,
                receiver_id,
                token_id,
                timestamp_created: env::block_timestamp(),
                balance: initial_balance,
                tokens_per_tick,
                auto_deposit_enabled,
                status: if initial_balance > 0 { StreamStatus::Active } else { StreamStatus::Initialized },
            },
        );
        stream_id
    }

    pub(crate) fn process_withdraw(&mut self, last_action: Timestamp) -> Balance {
        let payment = std::cmp::min(self.balance, self.get_amount_since_last_action(last_action));
        // TODO update history: self.tokens_transferred += payment
        if self.balance > payment {
            self.balance -= payment;
        } else {
            self.balance = 0;
            self.status = StreamStatus::Finished;
        }
        payment
    }

    pub(crate) fn get_amount_since_last_action(&self, last_action: Timestamp) -> Balance {
        if self.status != StreamStatus::Active {
            return 0;
        }
        let period = (env::block_timestamp() - last_action) as Balance;
        self.tokens_per_tick * period        
    }
}

impl Xyiming {
    pub(crate) fn extract_stream_or_panic(stream_id: &StreamId) -> Stream {
        Self::streams()
            .remove(&stream_id)
            .expect(ERR_STREAM_NOT_AVAILABLE)
    }
}
