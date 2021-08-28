use crate::*;

#[near_bindgen]
impl Xyiming {
    /// creates a stream
    /// if NEAR tokens-based, the attached deposit may be used to fill the stream up instantly
    #[payable]
    pub fn create_stream(
        &mut self,
        owner_id: ValidAccountId,
        receiver_id: ValidAccountId,
        token_name: String,
        tokens_per_tick: WrappedBalance,
    ) -> StreamId {
        assert!(
            env::attached_deposit() >= CREATE_STREAM_DEPOSIT,
            "{} {}",
            ERR_DEPOSIT_NOT_ENOUGH,
            CREATE_STREAM_DEPOSIT
        );
        // TODO generate stream_id reasonably
        let stream_id = env::sha256(&env::block_index().to_be_bytes())
            .as_slice()
            .try_into()
            .unwrap();
        let token_id = Self::get_token_id_by_name(&token_name).expect("token_name should be valid");
        let mut owner = self.extract_account_or_create(owner_id.as_ref());
        let mut receiver = self.extract_account_or_create(receiver_id.as_ref());
        let balance = if token_id == NEAR_TOKEN_ID {
            env::attached_deposit() - CREATE_STREAM_DEPOSIT
        } else {
            0
        };

        owner.add_output(owner_id.as_ref(), receiver_id.as_ref(), &stream_id);
        receiver.add_input(receiver_id.as_ref(), owner_id.as_ref(), &stream_id);

        self.save_account_or_panic(owner_id.as_ref(), &owner);
        self.save_account_or_panic(receiver_id.as_ref(), &receiver);

        let stream = Stream {
            owner_id: owner_id.into(),
            receiver_id: receiver_id.into(),
            token_id,
            balance,
            tokens_per_tick: tokens_per_tick.into(),
            tokens_transferred: 0,
            timestamp_started: env::block_timestamp(),
            status: STREAM_ACTIVE.to_string(),
        };
        Self::streams().insert(&stream_id, &stream);

        stream_id
    }

    /// depositing tokens to the stream
    #[payable]
    pub fn deposit(&mut self, stream_id: StreamId) {
        let mut stream = self.extract_stream_or_panic(&stream_id);
        assert!(
            stream.token_id == NEAR_TOKEN_ID,
            "only NEAR tokens are supported in this version of the contract"
        );
        stream.balance += env::attached_deposit();

        Self::streams().insert(&stream_id, &stream);
    }

    // TODO assert 1 yocto
    pub fn withdraw(&mut self, stream_id: StreamId) -> Promise {
        let mut stream = self.extract_stream_or_panic(&stream_id);
        assert!(
            stream.receiver_id == env::predecessor_account_id(),
            "{} {}",
            ERR_ACCESS_DENIED,
            stream.receiver_id
        );
        assert!(stream.status == STREAM_ACTIVE, "{}", ERR_STREAM_INACTIVE);
        let period = (env::block_timestamp() - stream.timestamp_started) as Balance;
        let expected_payment = stream.tokens_per_tick * period - stream.tokens_transferred;
        let promise = if stream.balance > expected_payment {
            stream.status = STREAM_FINISHED.to_string();
            stream.tokens_transferred += expected_payment;
            Self::finished().insert(&stream_id, &stream);
            Promise::new(env::predecessor_account_id()).transfer(expected_payment)
        } else {
            stream.tokens_transferred += stream.balance;
            Self::streams().insert(&stream_id, &stream);
            Promise::new(env::predecessor_account_id()).transfer(stream.balance)
        };

        // TODO process promise failure
        promise
    }
}
