use std::collections::HashMap;

use crate::*;

#[near_bindgen]
impl Xyiming {
    /// creates a stream
    /// if NEAR tokens-based, the attached deposit may be used to fill the stream up instantly
    #[payable]
    pub fn create_stream(
        &mut self,
        description: String,
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
        assert!(
            description.len() < MAX_TEXT_FIELD,
            "{}, maximum len of description {}",
            ERR_TEXT_FIELD_TOO_LONG,
            MAX_TEXT_FIELD
        );
        assert!(
            owner_id != receiver_id,
            "Self-transferring is not allowed in this version of the contract"
        );
        // TODO generate stream_id reasonably
        let stream_id = env::sha256(&env::block_index().to_be_bytes())
            .as_slice()
            .try_into()
            .unwrap();
        let token_id = Self::get_token_id_by_name(&token_name).expect("token_name should be valid");
        let mut owner = Self::extract_account_or_create(owner_id.as_ref());
        let mut receiver = Self::extract_account_or_create(receiver_id.as_ref());
        let balance = if token_id == NEAR_TOKEN_ID {
            env::attached_deposit() - CREATE_STREAM_DEPOSIT
        } else {
            0
        };

        owner.add_output(&stream_id);
        receiver.add_input(&stream_id);

        Self::save_account_or_panic(owner_id.as_ref(), &owner);
        Self::save_account_or_panic(receiver_id.as_ref(), &receiver);

        Stream::new(
            description,
            owner_id.into(),
            receiver_id.into(),
            token_id,
            balance,
            tokens_per_tick.into(),
        )
        .into()
    }

    /// depositing tokens to the stream
    #[payable]
    pub fn deposit(&mut self, stream_id: Base58CryptoHash) {
        let stream_id = stream_id.into();
        let mut stream = Self::extract_stream_or_panic(&stream_id);
        assert!(
            stream.token_id == NEAR_TOKEN_ID,
            "only NEAR tokens are supported in this version of the contract"
        );
        stream.balance += env::attached_deposit();

        Self::actual_streams().insert(&stream_id, &stream);
    }

    // TODO decide do we need to require receiver only
    pub fn withdraw(&mut self, stream_id: Base58CryptoHash) -> Promise {
        let stream_id = stream_id.into();
        let mut stream = Self::extract_stream_or_panic(&stream_id);
        assert!(
            stream.status == StreamStatus::Active,
            "{}",
            ERR_WITHDRAW_PAUSED
        );

        let payment = stream.process_withdraw();

        if stream.status.is_terminated() {
            Self::terminated_streams().insert(&stream_id, &stream);
        } else {
            Self::actual_streams().insert(&stream_id, &stream);
        }

        // TODO process promise failure
        Promise::new(stream.receiver_id).transfer(payment)
    }

    #[payable]
    pub fn pause_stream(&mut self, stream_id: Base58CryptoHash) -> Promise {
        let stream_id = stream_id.into();
        let mut stream = Self::extract_stream_or_panic(&stream_id);
        assert!(
            stream.receiver_id == env::predecessor_account_id()
                || stream.owner_id == env::predecessor_account_id(),
            "{} {} or {}",
            ERR_ACCESS_DENIED,
            stream.owner_id,
            stream.receiver_id
        );
        assert!(
            stream.status == StreamStatus::Active,
            "{}",
            ERR_PAUSE_PAUSED
        );

        let payment = stream.process_withdraw();

        if stream.status.is_terminated() {
            Self::terminated_streams().insert(&stream_id, &stream);
        } else {
            stream.status = StreamStatus::Paused;
            Self::actual_streams().insert(&stream_id, &stream);
        }

        // TODO process promise failure
        Promise::new(stream.receiver_id).transfer(payment)
    }

    /// Only owner can restart the stream
    #[payable]
    pub fn restart_stream(&mut self, stream_id: Base58CryptoHash) {
        let stream_id = stream_id.into();
        let mut stream = Self::extract_stream_or_panic(&stream_id);
        assert!(
            stream.owner_id == env::predecessor_account_id(),
            "{} {}",
            ERR_ACCESS_DENIED,
            stream.owner_id
        );
        assert!(
            stream.status == StreamStatus::Paused,
            "{}",
            ERR_RESTART_ACTIVE
        );
        stream.last_withdrawal = env::block_timestamp();
        stream.status = StreamStatus::Active;

        Self::actual_streams().insert(&stream_id, &stream);
    }

    /// stopping the stream, sending tokens to owner and receiver back
    /// returns two Promise: first for owner, second for receiver
    /// Promise for owner may be None if no funds left to return
    #[payable]
    pub fn stop_stream(&mut self, stream_id: Base58CryptoHash) -> (Option<Promise>, Promise) {
        let stream_id = stream_id.into();
        let mut stream = Self::extract_stream_or_panic(&stream_id);
        assert!(
            stream.receiver_id == env::predecessor_account_id()
                || stream.owner_id == env::predecessor_account_id(),
            "{} {} or {}",
            ERR_ACCESS_DENIED,
            stream.owner_id,
            stream.receiver_id
        );

        let receiver_payment = stream.process_withdraw();

        let owner_promise = if stream.status.is_terminated() {
            None
        } else {
            let owner_payment = stream.balance;
            stream.balance = 0;
            stream.status = StreamStatus::Interrupted;
            Some(Promise::new(stream.owner_id.clone()).transfer(owner_payment))
        };
        Self::terminated_streams().insert(&stream_id, &stream);

        // TODO process promises failure
        (
            owner_promise,
            Promise::new(stream.receiver_id).transfer(receiver_payment),
        )
    }

    /// Can be called only by receiver of input and owner of output, both conditions should be true
    #[payable]
    pub fn create_bridge(
        &mut self,
        description: String,
        input_stream_id: Base58CryptoHash,
        output_stream_id: Base58CryptoHash,
        redirect_rate: u32,
    ) -> Base58CryptoHash {
        assert!(
            description.len() < MAX_TEXT_FIELD,
            "{}, maximum len of description {}",
            ERR_TEXT_FIELD_TOO_LONG,
            MAX_TEXT_FIELD
        );
        assert!(
            env::attached_deposit() >= CREATE_BRIDGE_DEPOSIT,
            "{} {}",
            ERR_DEPOSIT_NOT_ENOUGH,
            CREATE_BRIDGE_DEPOSIT
        );
        let input_view = Self::actual_streams()
            .get(&input_stream_id.into())
            .expect(ERR_STREAM_NOT_AVAILABLE);
        let output_view = Self::actual_streams()
            .get(&output_stream_id.into())
            .expect(ERR_STREAM_NOT_AVAILABLE);
        assert!(
            input_view.receiver_id == env::predecessor_account_id(),
            "{} {}",
            ERR_ACCESS_DENIED,
            input_view.receiver_id
        );
        assert!(
            output_view.owner_id == env::predecessor_account_id(),
            "{} {}",
            ERR_ACCESS_DENIED,
            output_view.owner_id
        );

        // create the bridge and save in into the storage
        let bridge_id = Bridge::new(
            description,
            input_stream_id.into(),
            output_stream_id.into(),
            redirect_rate,
        );

        // add bridge to the account
        let mut account = Self::extract_account_or_create(&env::predecessor_account_id());
        assert!(account.bridges.insert(&bridge_id));
        Self::save_account_or_panic(&env::predecessor_account_id(), &account);

        bridge_id.into()
    }

    /// Can be called only by owner of the bridge
    #[payable]
    pub fn delete_bridge(&mut self, bridge_id: Base58CryptoHash) {
        // remove bridge from the account
        let mut account = Self::extract_account_or_create(&env::predecessor_account_id());
        assert!(
            account.bridges.remove(&bridge_id.into()),
            "{} bridge owner",
            ERR_ACCESS_DENIED,
        );
        Self::save_account_or_panic(&env::predecessor_account_id(), &account);

        // remove bridge from the storage
        Self::extract_bridge_or_panic(&bridge_id.into());
    }

    #[payable]
    pub fn push_flow(&mut self, account_id: ValidAccountId) -> Promise {
        let account_view = Self::accounts().get(account_id.as_ref()).unwrap();
        assert!(
            account_view.cron_calls_enabled,
            "{}",
            ERR_CRON_CALLS_DISABLED
        );
        // TODO process other tokens
        let mut total = HashMap::<StreamId, Balance>::new();
        let mut tokens_left = HashMap::<StreamId, Balance>::new();
        for input_stream_id in account_view.inputs.iter() {
            let mut input_stream = Self::extract_stream_or_panic(&input_stream_id);
            if input_stream.status != StreamStatus::Active {
                continue;
            }
            let payment = input_stream.process_withdraw();
            if input_stream.status.is_terminated() {
                Self::terminated_streams().insert(&input_stream_id, &input_stream);
            } else {
                Self::actual_streams().insert(&input_stream_id, &input_stream);
            }

            total.insert(input_stream_id, payment);
            tokens_left.insert(input_stream_id, payment);
        }
        for bridge_id in account_view.bridges.iter() {
            let bridge_view = Self::bridges().get(&bridge_id).unwrap();
            if tokens_left.contains_key(&bridge_view.input_stream_id) {
                let mut output_stream =
                    Self::extract_stream_or_panic(&bridge_view.output_stream_id);
                if output_stream.status != StreamStatus::Active {
                    continue;
                }
                // TODO process bridge subtraction overflow
                let transfer_amount = total.get(&bridge_view.input_stream_id).unwrap()
                    / 1_000_000_000
                    * bridge_view.redirect_rate as u128;
                tokens_left.insert(
                    bridge_view.input_stream_id,
                    tokens_left.get(&bridge_view.input_stream_id).unwrap() - transfer_amount,
                );
                output_stream.balance += transfer_amount;
                Self::actual_streams().insert(&bridge_view.output_stream_id, &output_stream);
            }
        }

        // TODO calculate the commission to cover cron expenses
        let receiver_payment = tokens_left.iter().map(|(_, v)| v).sum::<Balance>() * 999 / 1000;

        Promise::new(account_id.into()).transfer(receiver_payment)
    }
}
