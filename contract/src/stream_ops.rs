use crate::*;

impl Contract {
    pub(crate) fn process_create_stream(
        &mut self,
        sender_id: AccountId,
        description: Option<String>,
        receiver_id: AccountId,
        mut token: Token,
        mut initial_balance: Balance,
        tokens_per_sec: Balance,
        is_auto_start_enabled: Option<bool>,
        is_expirable: Option<bool>,
    ) -> Result<(), ContractError> {
        if description.is_some() && description.clone().unwrap().len() >= MAX_DESCRIPTION_LEN {
            return Err(ContractError::DescriptionTooLong {
                max_description_len: MAX_DESCRIPTION_LEN,
                received: description.clone().unwrap().len(),
            });
        }
        if tokens_per_sec == 0 || tokens_per_sec > MAX_STREAMING_SPEED {
            return Err(ContractError::InvalidStreamingSpeed {
                min_streaming_speed: MIN_STREAMING_SPEED,
                max_streaming_speed: MAX_STREAMING_SPEED,
                received: tokens_per_sec,
            });
        }
        let is_auto_start_enabled = match is_auto_start_enabled {
            Some(value) => value,
            None => true,
        };
        let is_expirable = match is_expirable {
            Some(value) => value,
            None => true,
        };

        if token.is_listed {
            // Take commission as DAO proposed
            if initial_balance < token.commission_on_create {
                return Err(ContractError::InsufficientDeposit {
                    expected: token.commission_on_create,
                    received: initial_balance,
                });
            }
            initial_balance -= token.commission_on_create;

            if is_auto_start_enabled && initial_balance == 0 {
                return Err(ContractError::ZeroBalanceStreamStart);
            }

            token.collected_commission += token.commission_on_create;
        } else {
            let mut signer = self.extract_account(&env::signer_account_id())?;
            if signer.deposit < self.dao.commission_unlisted {
                return Err(ContractError::InsufficientNearBalance {
                    requested: self.dao.commission_unlisted,
                    left: signer.deposit,
                });
            }
            signer.deposit -= self.dao.commission_unlisted;
            self.save_account(&env::signer_account_id(), signer)?;
        }

        if initial_balance > MAX_AMOUNT {
            return Err(ContractError::ExceededMaxBalance {
                max_amount: MAX_AMOUNT,
            });
        }

        let mut stream = Stream::new(
            description,
            sender_id.clone(),
            receiver_id.clone(),
            token.account_id.clone(),
            initial_balance.into(),
            tokens_per_sec,
            is_expirable,
        );

        self.process_action(&mut stream, ActionType::Init)?;
        if is_auto_start_enabled {
            self.process_action(&mut stream, ActionType::Start)?;
        }

        self.save_stream(&stream.id.clone(), stream)?;

        self.stats_inc_deposit(token.account_id.clone(), initial_balance);
        if is_auto_start_enabled {
            self.stats_inc_active_streams(token.account_id.clone());
        }
        self.stats_inc_streams(token.account_id);

        Ok(())
    }

    pub(crate) fn process_deposit(
        &mut self,
        token: Token,
        stream_id: CryptoHash,
        amount: Balance,
    ) -> Result<(), ContractError> {
        let stream_id = stream_id.into();
        let mut stream = self.extract_stream(&stream_id)?;
        if stream.status.is_terminated() {
            return Err(ContractError::StreamTerminated { stream_id });
        }

        if stream.available_to_withdraw() == stream.balance
            && stream.balance > 0
            && stream.is_expirable
        {
            let action = self.process_action(
                &mut stream,
                ActionType::Stop {
                    reason: StreamFinishReason::FinishedBecauseCannotBeExtended,
                },
            )?;
            debug_assert!(action.is_empty());
            self.save_stream(&stream_id, stream)?;
            return Err(ContractError::StreamExpired { stream_id });
        }

        if stream.token_account_id != token.account_id {
            return Err(ContractError::InvalidToken {
                expected: stream.token_account_id,
                received: token.account_id,
            });
        }

        if amount > MAX_AMOUNT || stream.balance + amount > MAX_AMOUNT {
            return Err(ContractError::ExceededMaxBalance {
                max_amount: MAX_AMOUNT,
            });
        }

        stream.balance += amount;

        self.save_stream(&stream_id, stream)?;

        Ok(())
    }

    pub fn process_start_stream(&mut self, stream_id: CryptoHash) -> Result<(), ContractError> {
        let mut stream = self.extract_stream(&stream_id)?;

        if stream.owner_id != env::predecessor_account_id() {
            return Err(ContractError::CallerIsNotStreamOwner {
                expected: stream.owner_id,
                received: env::predecessor_account_id(),
            });
        }
        if stream.status != StreamStatus::Paused && stream.status != StreamStatus::Initialized {
            return Err(ContractError::CannotStartStream {
                stream_status: stream.status,
            });
        }
        if stream.balance == 0 {
            return Err(ContractError::ZeroBalanceStreamStart);
        }

        if env::prepaid_gas() - env::used_gas() < MIN_GAS_FOR_PROCESS_ACTION {
            return Err(ContractError::InsufficientGas {
                expected: MIN_GAS_FOR_PROCESS_ACTION,
                left: env::prepaid_gas() - env::used_gas(),
            });
        }

        assert!(self
            .process_action(&mut stream, ActionType::Start)?
            .is_empty());

        self.save_stream(&stream_id, stream)?;

        Ok(())
    }

    pub fn process_pause_stream(
        &mut self,
        stream_id: CryptoHash,
    ) -> Result<Vec<Promise>, ContractError> {
        let mut stream = self.extract_stream(&stream_id)?;

        if stream.owner_id != env::predecessor_account_id()
            && stream.receiver_id != env::predecessor_account_id()
        {
            return Err(ContractError::CallerIsNotStreamActor {
                owner: stream.owner_id,
                receiver: stream.receiver_id,
                caller: env::predecessor_account_id(),
            });
        }
        if stream.status != StreamStatus::Active {
            return Err(ContractError::CannotPauseStream {
                stream_status: stream.status,
            });
        }

        if env::prepaid_gas() - env::used_gas() < MIN_GAS_FOR_PROCESS_ACTION {
            return Err(ContractError::InsufficientGas {
                expected: MIN_GAS_FOR_PROCESS_ACTION,
                left: env::prepaid_gas() - env::used_gas(),
            });
        }

        let promises = self.process_action(&mut stream, ActionType::Pause)?;

        self.save_stream(&stream_id, stream)?;

        Ok(promises)
    }

    pub fn process_stop_stream(
        &mut self,
        stream_id: CryptoHash,
    ) -> Result<Vec<Promise>, ContractError> {
        let mut stream = self.extract_stream(&stream_id)?;

        if stream.owner_id != env::predecessor_account_id()
            && stream.receiver_id != env::predecessor_account_id()
        {
            return Err(ContractError::CallerIsNotStreamActor {
                owner: stream.owner_id,
                receiver: stream.receiver_id,
                caller: env::predecessor_account_id(),
            });
        }
        if stream.status.is_terminated() {
            return Err(ContractError::CannotStopStream {
                stream_status: stream.status,
            });
        }

        let reason = if stream.owner_id == env::predecessor_account_id() {
            StreamFinishReason::StoppedByOwner
        } else {
            StreamFinishReason::StoppedByReceiver
        };

        if env::prepaid_gas() - env::used_gas() < MIN_GAS_FOR_PROCESS_ACTION {
            return Err(ContractError::InsufficientGas {
                expected: MIN_GAS_FOR_PROCESS_ACTION,
                left: env::prepaid_gas() - env::used_gas(),
            });
        }

        let promises = self.process_action(&mut stream, ActionType::Stop { reason })?;

        self.save_stream(&stream_id, stream)?;

        Ok(promises)
    }

    pub fn process_withdraw(
        &mut self,
        stream_id: CryptoHash,
        is_storage_deposit_needed: bool,
    ) -> Result<Vec<Promise>, ContractError> {
        let mut stream = self.extract_stream(&stream_id)?;

        let receiver_view = self.view_account(&stream.receiver_id)?;

        if receiver_view.id != env::predecessor_account_id() && !receiver_view.is_cron_allowed {
            return Err(ContractError::CronCallsForbidden);
        }

        if stream.status != StreamStatus::Active {
            return Err(ContractError::CannotWithdraw {
                stream_status: stream.status,
            });
        }

        if env::prepaid_gas() - env::used_gas() < MIN_GAS_FOR_PROCESS_ACTION {
            return Err(ContractError::InsufficientGas {
                expected: MIN_GAS_FOR_PROCESS_ACTION,
                left: env::prepaid_gas() - env::used_gas(),
            });
        }

        let promises = self.process_action(
            &mut stream,
            ActionType::Withdraw {
                is_storage_deposit_needed,
            },
        )?;

        self.save_stream(&stream_id, stream)?;

        Ok(promises)
    }
}
