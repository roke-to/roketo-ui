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
    ) -> Base58CryptoHash {
        assert!(
            env::attached_deposit() >= CREATE_STREAM_DEPOSIT,
            "{} {}",
            ERR_DEPOSIT_NOT_ENOUGH,
            CREATE_STREAM_DEPOSIT
        );
        assert!(owner_id != receiver_id, "WTF man");
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

        owner.add_output(&stream_id);
        receiver.add_input(&stream_id);

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

        stream_id.into()
    }

    /// depositing tokens to the stream
    #[payable]
    pub fn deposit(&mut self, stream_id: Base58CryptoHash) {
        let stream_id = stream_id.into();
        let mut stream = self.extract_stream_or_panic(&stream_id);
        assert!(
            stream.token_id == NEAR_TOKEN_ID,
            "only NEAR tokens are supported in this version of the contract"
        );
        stream.balance += env::attached_deposit();

        Self::streams().insert(&stream_id, &stream);
    }

    /// can be executed only by receiver
    pub fn withdraw(&mut self, stream_id: Base58CryptoHash) -> Promise {
        let stream_id = stream_id.into();
        let mut stream = self.extract_stream_or_panic(&stream_id);
        assert!(
            stream.receiver_id == env::predecessor_account_id(),
            "{} {}",
            ERR_ACCESS_DENIED,
            stream.receiver_id
        );

        let promise = Self::withdraw_receiver(&mut stream);

        if stream.status == STREAM_FINISHED {
            Self::finished().insert(&stream_id, &stream);
        } else {
            Self::streams().insert(&stream_id, &stream);
        }

        // TODO process promise failure
        promise
    }

    /// stopping the stream, sending tokens to owner and receiver back
    /// returns two Promise: first for owner, second for receiver
    /// Promise for owner may be None if no funds left to return
    #[payable]
    pub fn stop_stream(&mut self, stream_id: Base58CryptoHash) -> (Option<Promise>, Promise) {
        let stream_id = stream_id.into();
        let mut stream = self.extract_stream_or_panic(&stream_id);
        assert!(
            stream.receiver_id == env::predecessor_account_id()
                || stream.owner_id == env::predecessor_account_id(),
            "{} {} or {}",
            ERR_ACCESS_DENIED,
            stream.owner_id,
            stream.receiver_id
        );

        let receiver_promise = Self::withdraw_receiver(&mut stream);

        let owner_promise = if stream.status == STREAM_FINISHED {
            None
        } else {
            let payment = stream.balance;
            stream.balance = 0;
            stream.status = STREAM_FINISHED.to_string();
            Some(Promise::new(stream.owner_id.clone()).transfer(payment))
        };
        Self::finished().insert(&stream_id, &stream);

        // TODO process promises failure
        (owner_promise, receiver_promise)
    }
}
