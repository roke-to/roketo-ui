use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[cfg_attr(not(target_arch = "wasm32"), derive(Debug))]
#[serde(crate = "near_sdk::serde")]
pub struct Stream {
    #[serde(with = "b58_dec_format")]
    pub id: CryptoHash,
    pub description: Option<String>,
    pub owner_id: AccountId,
    pub receiver_id: AccountId,
    pub token_account_id: AccountId,

    #[serde(with = "u64_dec_format")]
    pub timestamp_created: Timestamp,
    #[serde(with = "u64_dec_format")]
    pub last_action: Timestamp,

    #[serde(with = "u128_dec_format")]
    pub balance: Balance,
    #[serde(with = "u128_dec_format")]
    pub tokens_per_sec: Balance,

    pub status: StreamStatus,
    #[serde(with = "u128_dec_format")]
    pub tokens_total_withdrawn: Balance,

    pub is_expirable: bool,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum VStream {
    Current(Stream),
}

impl From<VStream> for Stream {
    fn from(v: VStream) -> Self {
        match v {
            VStream::Current(c) => c,
        }
    }
}

impl From<Stream> for VStream {
    fn from(c: Stream) -> Self {
        VStream::Current(c)
    }
}

impl Stream {
    pub(crate) fn new(
        description: Option<String>,
        owner_id: AccountId,
        receiver_id: AccountId,
        token_account_id: AccountId,
        initial_balance: Balance,
        tokens_per_sec: Balance,
        is_expirable: bool,
    ) -> Stream {
        let id = env::sha256(&env::random_seed())
            .as_slice()
            .try_into()
            .unwrap();
        Self {
            id,
            description,
            owner_id,
            receiver_id,
            token_account_id,
            timestamp_created: env::block_timestamp(),
            last_action: env::block_timestamp(),
            balance: initial_balance,
            tokens_per_sec,
            status: StreamStatus::Initialized,
            tokens_total_withdrawn: 0,
            is_expirable,
        }
    }

    pub(crate) fn process_withdraw(&mut self, token: &Token) -> (Balance, Balance) {
        let gross_payment = self.available_to_withdraw();
        self.tokens_total_withdrawn += gross_payment;
        let (payment, commission) = if token.is_listed {
            token.apply_commission(std::cmp::min(gross_payment, self.balance))
        } else {
            (gross_payment, 0)
        };
        if self.balance > gross_payment {
            self.balance -= gross_payment;
        } else {
            self.balance = 0;
            self.status = StreamStatus::Finished {
                reason: StreamFinishReason::FinishedNatually,
            };
        }
        // This update of last_action is useless here
        // however it helps to keep invariant of stream status.
        self.last_action = env::block_timestamp();
        (payment, commission)
    }

    pub(crate) fn available_to_withdraw(&self) -> Balance {
        if self.status == StreamStatus::Active {
            let period = (env::block_timestamp() - self.last_action) as u128;
            std::cmp::min(
                self.balance,
                period / TICKS_PER_SECOND * self.tokens_per_sec,
            )
        } else {
            0
        }
    }
}

impl Contract {
    pub(crate) fn process_action(
        &mut self,
        stream: &mut Stream,
        action_type: ActionType,
    ) -> Result<Vec<Promise>, ContractError> {
        let mut owner = self.extract_account(&stream.owner_id)?;
        let mut receiver = self.extract_account(&stream.receiver_id)?;
        let mut promises = vec![];

        if action_type == ActionType::Init {
            assert!(owner.inactive_outgoing_streams.insert(&stream.id));
            assert!(receiver.inactive_incoming_streams.insert(&stream.id));
            owner.last_created_stream = Some(stream.id);
        } else {
            assert!(!stream.status.is_terminated());
            match action_type {
                ActionType::Start => {
                    assert!(owner.inactive_outgoing_streams.remove(&stream.id));
                    assert!(receiver.inactive_incoming_streams.remove(&stream.id));
                    assert!(owner.active_outgoing_streams.insert(&stream.id));
                    assert!(receiver.active_incoming_streams.insert(&stream.id));
                    owner
                        .total_outgoing
                        .entry(stream.token_account_id.clone())
                        .and_modify(|e| *e += stream.tokens_per_sec)
                        .or_insert(stream.tokens_per_sec);
                    receiver
                        .total_incoming
                        .entry(stream.token_account_id.clone())
                        .and_modify(|e| *e += stream.tokens_per_sec)
                        .or_insert(stream.tokens_per_sec);
                    stream.status = StreamStatus::Active;
                    self.stats_inc_active_streams(&stream.token_account_id);
                }
                ActionType::Pause => {
                    assert_eq!(stream.status, StreamStatus::Active);
                    promises.push(self.process_payment(stream, &mut receiver, true)?);
                    assert!(owner.active_outgoing_streams.remove(&stream.id));
                    assert!(receiver.active_incoming_streams.remove(&stream.id));
                    assert!(owner.inactive_outgoing_streams.insert(&stream.id));
                    assert!(receiver.inactive_incoming_streams.insert(&stream.id));
                    owner
                        .total_outgoing
                        .entry(stream.token_account_id.clone())
                        .and_modify(|e| *e -= stream.tokens_per_sec);
                    receiver
                        .total_incoming
                        .entry(stream.token_account_id.clone())
                        .and_modify(|e| *e -= stream.tokens_per_sec);
                    if stream.status == StreamStatus::Active {
                        // The stream may be stopped while payment processing
                        stream.status = StreamStatus::Paused;
                    }
                    self.stats_dec_active_streams(&stream.token_account_id);
                }
                ActionType::Stop { reason } => {
                    if stream.status == StreamStatus::Active {
                        promises.push(self.process_payment(stream, &mut receiver, true)?);
                        assert!(owner.active_outgoing_streams.remove(&stream.id));
                        assert!(receiver.active_incoming_streams.remove(&stream.id));
                        owner
                            .total_outgoing
                            .entry(stream.token_account_id.clone())
                            .and_modify(|e| *e -= stream.tokens_per_sec);
                        receiver
                            .total_incoming
                            .entry(stream.token_account_id.clone())
                            .and_modify(|e| *e -= stream.tokens_per_sec);
                        self.stats_dec_active_streams(&stream.token_account_id);
                    } else {
                        assert!(owner.inactive_outgoing_streams.remove(&stream.id));
                        assert!(receiver.inactive_incoming_streams.remove(&stream.id));
                    }
                    if !stream.status.is_terminated() {
                        // Refund can be requested only if stream is not terminated naturally yet
                        promises.push(self.process_refund(stream)?);
                        stream.status = StreamStatus::Finished { reason };
                    }
                }
                ActionType::Init => {
                    // Processed separately
                    unreachable!();
                }
                ActionType::Withdraw {
                    is_storage_deposit_needed,
                } => {
                    assert_eq!(stream.status, StreamStatus::Active);
                    promises.push(self.process_payment(
                        stream,
                        &mut receiver,
                        is_storage_deposit_needed,
                    )?);
                    if stream.status.is_terminated() {
                        assert_eq!(
                            stream.status,
                            StreamStatus::Finished {
                                reason: StreamFinishReason::FinishedNatually
                            }
                        );
                        assert!(owner.active_outgoing_streams.remove(&stream.id));
                        assert!(receiver.active_incoming_streams.remove(&stream.id));
                        owner
                            .total_outgoing
                            .entry(stream.token_account_id.clone())
                            .and_modify(|e| *e -= stream.tokens_per_sec);
                        receiver
                            .total_incoming
                            .entry(stream.token_account_id.clone())
                            .and_modify(|e| *e -= stream.tokens_per_sec);
                        self.stats_dec_active_streams(&stream.token_account_id);
                    }
                }
            }
        }

        stream.last_action = env::block_timestamp();
        self.save_account(owner)?;
        self.save_account(receiver)?;

        Ok(promises)
    }

    fn process_payment(
        &mut self,
        stream: &mut Stream,
        account: &mut Account,
        is_storage_deposit_needed: bool,
    ) -> Result<Promise, ContractError> {
        let token = self.dao.get_token_or_unlisted(&stream.token_account_id);
        let (payment, commission) = stream.process_withdraw(&token);
        account
            .total_received
            .entry(stream.token_account_id.clone())
            .and_modify(|e| *e += payment)
            .or_insert(payment);
        self.dao
            .tokens
            .entry(stream.token_account_id.clone())
            .and_modify(|e| e.collected_commission += commission);
        self.stats_withdraw(&token, payment, commission);
        self.ft_transfer(
            &token,
            &stream.receiver_id,
            payment,
            is_storage_deposit_needed,
        )
    }

    fn process_refund(&mut self, stream: &mut Stream) -> Result<Promise, ContractError> {
        let token = self.dao.get_token_or_unlisted(&stream.token_account_id);
        let refund = stream.balance;
        stream.balance = 0;
        self.stats_refund(&token, refund);
        self.ft_transfer(&token, &stream.owner_id, refund, true)
    }

    pub(crate) fn view_stream(&mut self, stream_id: &StreamId) -> Result<Stream, ContractError> {
        match self.streams.get(stream_id) {
            Some(vstream) => Ok(vstream.into()),
            None => Err(ContractError::UnreachableStream {
                stream_id: *stream_id,
            }),
        }
    }

    pub(crate) fn extract_stream(&mut self, stream_id: &StreamId) -> Result<Stream, ContractError> {
        match self.streams.remove(stream_id) {
            Some(vstream) => Ok(vstream.into()),
            None => Err(ContractError::UnreachableStream {
                stream_id: *stream_id,
            }),
        }
    }

    pub(crate) fn save_stream(&mut self, stream: Stream) -> Result<(), ContractError> {
        match self.streams.insert(&stream.id.clone(), &stream.into()) {
            None => Ok(()),
            Some(_) => Err(ContractError::DataCorruption),
        }
    }
}
