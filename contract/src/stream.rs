use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Stream {
    pub description: String,
    pub owner_id: AccountId,
    pub receiver_id: AccountId,
    pub token_id: TokenId,
    pub balance: Balance,
    pub timestamp_created: Timestamp,
    pub last_withdrawal: Timestamp,
    pub tokens_per_tick: Balance,
    pub tokens_transferred: Balance,
    // TODO refactor StreamStatus
    pub status: StreamStatus,
    // TODO add history of operations
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct StreamView {
    pub stream_id: Base58CryptoHash,
    pub description: String,
    pub owner_id: String,
    pub receiver_id: String,
    pub token_name: String,
    pub balance: WrappedBalance,
    pub timestamp_created: WrappedTimestamp,
    pub last_withdrawal: WrappedTimestamp,
    pub tokens_per_tick: WrappedBalance,
    pub tokens_transferred: WrappedBalance,
    pub tokens_available: WrappedBalance,
    pub status: String,
}

impl From<&Stream> for StreamView {
    fn from(s: &Stream) -> Self {
        Self {
            stream_id: Base58CryptoHash::default(), // will be filled later
            description: s.description.clone(),
            owner_id: s.owner_id.clone(),
            receiver_id: s.receiver_id.clone(),
            token_name: Xyiming::get_token_name_by_id(s.token_id),
            balance: s.balance.into(),
            timestamp_created: s.timestamp_created.into(),
            last_withdrawal: s.last_withdrawal.into(),
            tokens_per_tick: s.tokens_per_tick.into(),
            tokens_transferred: s.tokens_transferred.into(),
            tokens_available: s.get_available_amount().into(),
            status: s.status.to_string(),
        }
    }
}

impl Stream {
    pub(crate) fn new(
        description: String,
        owner_id: AccountId,
        receiver_id: AccountId,
        token_id: TokenId,
        balance: Balance,
        tokens_per_tick: Balance,
    ) -> StreamId {
        let stream_id = env::sha256(&env::block_index().to_be_bytes())
            .as_slice()
            .try_into()
            .unwrap();
        Xyiming::actual_streams().insert(
            &stream_id,
            &Self {
                description,
                owner_id,
                receiver_id,
                token_id,
                balance,
                tokens_per_tick,
                tokens_transferred: 0,
                timestamp_created: env::block_timestamp(),
                last_withdrawal: env::block_timestamp(),
                status: StreamStatus::Active,
            },
        );
        stream_id
    }

    pub(crate) fn process_withdraw(&mut self) -> Balance {
        let payment = self.get_available_amount();
        self.tokens_transferred += payment;
        self.last_withdrawal = env::block_timestamp();
        if self.balance > payment {
            self.balance -= payment;
        } else {
            self.balance = 0;
            self.status = StreamStatus::Finished;
        }
        payment
    }

    pub(crate) fn get_available_amount(&self) -> Balance {
        // the following line should be always true due extract_stream_or_panic returns only active streams
        if self.status != StreamStatus::Active {
            return 0;
        }
        debug_assert!(!self.status.is_terminated(), "{}", ERR_STREAM_NOT_AVAILABLE);
        let period = (env::block_timestamp() - self.last_withdrawal) as Balance;
        let expected_payment = self.tokens_per_tick * period;
        std::cmp::min(self.balance, expected_payment)
    }
}

impl Xyiming {
    pub(crate) fn extract_stream_or_panic(stream_id: &StreamId) -> Stream {
        Self::actual_streams()
            .remove(&stream_id)
            .expect(ERR_STREAM_NOT_AVAILABLE)
    }
}
