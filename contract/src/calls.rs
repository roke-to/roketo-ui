use crate::*;

#[near_bindgen]
impl Xyiming {
    /// creates a stream
    /// if NEAR tokens-based, the attached deposit may be used to fill the stream up instantly
    #[payable]
    pub fn create_stream(
        &mut self,
        description: Option<String>,
        owner_id: ValidAccountId,
        receiver_id: ValidAccountId,
        token_name: String,
        tokens_per_tick: WrappedBalance,
        auto_deposit_enabled: bool,
    ) -> Base58CryptoHash {
        assert!(
            env::attached_deposit() >= CREATE_STREAM_DEPOSIT,
            "{} {}",
            ERR_DEPOSIT_NOT_ENOUGH,
            CREATE_STREAM_DEPOSIT
        );
        if description.is_some() {
            assert!(
                description.clone().unwrap().len() < MAX_TEXT_FIELD,
                "{}, maximum len of description {}",
                ERR_TEXT_FIELD_TOO_LONG,
                MAX_TEXT_FIELD
            );
        }
        assert!(
            owner_id != receiver_id,
            "Self-transferring is not allowed in this version of the contract"
        );
        // TODO generate stream_id reasonably
        let stream_id = env::sha256(&env::block_index().to_be_bytes())
            .as_slice()
            .try_into()
            .unwrap();

        let mut owner = Self::extract_account_or_create(owner_id.as_ref());
        owner.update_state();
        owner.add_output(&stream_id);
        Self::save_account_or_panic(owner_id.as_ref(), &owner);
        let mut receiver = Self::extract_account_or_create(receiver_id.as_ref());
        receiver.update_state();
        receiver.add_input(&stream_id);
        Self::save_account_or_panic(receiver_id.as_ref(), &receiver);
        // TODO process promise failure

        let token_id = Self::get_token_id_by_name(&token_name).expect(ERR_INVALID_TOKEN);
        let balance = if token_id == NEAR_TOKEN_ID {
            env::attached_deposit() - CREATE_STREAM_DEPOSIT
        } else {
            0
        };
        Stream::new(
            description,
            owner_id.into(),
            receiver_id.into(),
            token_id,
            balance,
            tokens_per_tick.into(),
            auto_deposit_enabled,
        )
        .into()
    }

    /// depositing tokens to the stream
    #[payable]
    pub fn deposit(&mut self, stream_id: Base58CryptoHash) {
        let stream_id = stream_id.into();
        let mut stream = Self::extract_stream_or_panic(&stream_id);
        assert!(stream.token_id == NEAR_TOKEN_ID, "{}", ERR_NOT_NEAR_TOKEN);
        stream.balance += env::attached_deposit();

        Self::streams().insert(&stream_id, &stream);
    }

    /// depositing ft tokens to the stream
    #[private]
    pub fn deposit_ft(&mut self, stream_id: Base58CryptoHash, amount: WrappedBalance) {
        let stream_id = stream_id.into();
        let mut stream = Self::extract_stream_or_panic(&stream_id);
        assert!(stream.token_id != NEAR_TOKEN_ID, "{}", ERR_NOT_FT_TOKEN);
        stream.balance += Balance::from(amount);

        Self::streams().insert(&stream_id, &stream);
    }

    pub fn update_account(&mut self, account_id: ValidAccountId) -> Vec<Promise> {
        let mut account = Self::extract_account_or_create(account_id.as_ref());

        let promises = account.update_state();

        Self::save_account_or_panic(account_id.as_ref(), &account);

        // TODO process promise failure
        promises
    }

    /// Only owner can restart the stream
    #[payable]
    pub fn start_stream(&mut self, stream_id: Base58CryptoHash) {
        let stream_id = stream_id.into();
        let stream_view = Self::streams().get(&stream_id).unwrap();
        assert!(
            stream_view.owner_id == env::predecessor_account_id(),
            "{} {}",
            ERR_ACCESS_DENIED,
            stream_view.owner_id
        );
        assert!(
            stream_view.status == StreamStatus::Paused || stream_view.status == StreamStatus::Initialized,
            "{}",
            ERR_CANNOT_START_STREAM,
        );

        let mut owner = Self::extract_account_or_create(&stream_view.owner_id);
        owner.update_state();
        Self::save_account_or_panic(&stream_view.owner_id, &owner);
        let mut receiver = Self::extract_account_or_create(&stream_view.receiver_id);
        receiver.update_state();
        Self::save_account_or_panic(&stream_view.receiver_id, &receiver);
        // TODO process promise failure

        let mut stream = Self::extract_stream_or_panic(&stream_id);
        stream.status = StreamStatus::Active;
        Self::streams().insert(&stream_id, &stream);
    }

    #[payable]
    pub fn pause_stream(&mut self, stream_id: Base58CryptoHash) {
        let stream_id = stream_id.into();
        let stream_view = Self::streams().get(&stream_id).unwrap();
        assert!(
            stream_view.receiver_id == env::predecessor_account_id()
                || stream_view.owner_id == env::predecessor_account_id(),
            "{} {} or {}",
            ERR_ACCESS_DENIED,
            stream_view.owner_id,
            stream_view.receiver_id
        );
        assert!(
            stream_view.status == StreamStatus::Active,
            "{}",
            ERR_PAUSE_PAUSED
        );

        let mut owner = Self::extract_account_or_create(&stream_view.owner_id);
        owner.update_state();
        Self::save_account_or_panic(&stream_view.owner_id, &owner);
        let mut receiver = Self::extract_account_or_create(&stream_view.receiver_id);
        receiver.update_state();
        Self::save_account_or_panic(&stream_view.receiver_id, &receiver);
        // TODO process promise failure

        let mut stream = Self::extract_stream_or_panic(&stream_id);
        if !stream.status.is_terminated() {
            // Only actual steams can be paused
            stream.status = StreamStatus::Paused;
        }
        Self::streams().insert(&stream_id, &stream);
    }

    #[payable]
    pub fn stop_stream(&mut self, stream_id: Base58CryptoHash) {
        let stream_id = stream_id.into();
        let stream_view = Self::streams().get(&stream_id).unwrap();
        assert!(
            stream_view.owner_id == env::predecessor_account_id() || stream_view.receiver_id == env::predecessor_account_id(),
            "{} {} {}",
            ERR_ACCESS_DENIED,
            stream_view.owner_id,
            stream_view.receiver_id
        );
        assert!(
            !stream_view.status.is_terminated(),
            "{}",
            ERR_STREAM_NOT_AVAILABLE,
        );

        let mut owner = Self::extract_account_or_create(&stream_view.owner_id);
        owner.update_state();
        Self::save_account_or_panic(&stream_view.owner_id, &owner);
        let mut receiver = Self::extract_account_or_create(&stream_view.receiver_id);
        receiver.update_state();
        Self::save_account_or_panic(&stream_view.receiver_id, &receiver);
        // TODO process promise failure

        let mut stream = Self::extract_stream_or_panic(&stream_id);
        if !stream.status.is_terminated() {
            if stream.owner_id == env::predecessor_account_id() {
                stream.status = StreamStatus::Interrupted;
            } else {
                stream.status = StreamStatus::Finished;
            }
            Self::build_promise(stream.token_id, stream.owner_id.clone(), stream.balance);
            stream.balance = 0;
            // TODO process promise failure
        }
        Self::streams().insert(&stream_id, &stream);
    }
}
