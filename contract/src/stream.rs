use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Stream {
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
            owner_id: s.owner_id.clone(),
            receiver_id: s.receiver_id.clone(),
            token_name: Xyiming::get_token_name_by_id(s.token_id),
            balance: s.balance.into(),
            timestamp_created: s.timestamp_created.into(),
            last_withdrawal: s.last_withdrawal.into(),
            tokens_per_tick: s.tokens_per_tick.into(),
            tokens_transferred: s.tokens_transferred.into(),
            tokens_available: Xyiming::get_available_amount(s).into(),
            status: s.status.to_string(),
        }
    }
}

impl Xyiming {
    pub(crate) fn get_available_amount(stream: &Stream) -> Balance {
        // the following line should be always true due extract_stream_or_panic returns only active streams
        if stream.status != StreamStatus::Active {
            return 0;
        }
        debug_assert!(
            !stream.status.is_terminated(),
            "{}",
            ERR_STREAM_NOT_AVAILABLE
        );
        let period = (env::block_timestamp() - stream.last_withdrawal) as Balance;
        let expected_payment = stream.tokens_per_tick * period;
        std::cmp::min(stream.balance, expected_payment)
    }

    pub(crate) fn withdraw_receiver(stream: &mut Stream) -> Promise {
        let payment = Self::get_available_amount(&stream);
        stream.tokens_transferred += payment;
        stream.last_withdrawal = env::block_timestamp();
        if stream.balance > payment {
            stream.balance -= payment;
            Promise::new(stream.receiver_id.clone()).transfer(payment)
        } else {
            stream.balance = 0;
            stream.status = StreamStatus::Finished;
            /*let mut owner = self.extract_account_or_create(&stream.owner_id);
            let mut receiver = self.extract_account_or_create(&stream.receiver_id);
            owner.remove_output(&stream_id);
            receiver.remove_input(&stream_id);
            self.save_account_or_panic(&stream.owner_id, &owner);
            self.save_account_or_panic(&stream.receiver_id, &receiver);*/
            Promise::new(stream.receiver_id.clone()).transfer(payment)
        }
    }

    pub(crate) fn extract_stream_or_panic(&mut self, stream_id: &StreamId) -> Stream {
        Self::streams()
            .remove(&stream_id)
            .expect(ERR_STREAM_NOT_AVAILABLE)
    }
}
