use crate::*;

impl Contract {
    pub(crate) fn process_create_stream(
        &mut self,
        sender_id: &AccountId,
        owner_id: AccountId,
        description: Option<String>,
        receiver_id: AccountId,
        token_account_id: AccountId,
        initial_balance: Balance,
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

        self.create_account_if_not_exist(sender_id)?;
        self.create_account_if_not_exist(&owner_id)?;
        self.create_account_if_not_exist(&receiver_id)?;

        let mut sender = self.extract_account(sender_id)?;
        let mut balance = initial_balance;

        let mut token = self.dao.get_token_or_unlisted(&token_account_id);

        if token.is_listed {
            // Take commission as DAO proposed
            if balance < token.commission_on_create {
                return Err(ContractError::InsufficientNearDeposit {
                    expected: token.commission_on_create,
                    received: balance,
                });
            }
            balance -= token.commission_on_create;

            if is_auto_start_enabled && balance == 0 {
                return Err(ContractError::ZeroBalanceStreamStart);
            }

            token.collected_commission += token.commission_on_create;
            self.dao.tokens.insert(token_account_id.clone(), token);
        } else {
            if sender.deposit < self.dao.commission_unlisted {
                return Err(ContractError::InsufficientNearBalance {
                    requested: self.dao.commission_unlisted,
                    left: sender.deposit,
                });
            }
            sender.deposit -= self.dao.commission_unlisted;
        }
        sender.total_streams_created += 1;
        self.save_account(sender)?;

        if balance > MAX_AMOUNT {
            return Err(ContractError::ExceededMaxBalance {
                max_amount: MAX_AMOUNT,
            });
        }

        let mut stream = Stream::new(
            description,
            owner_id.clone(),
            receiver_id.clone(),
            token_account_id,
            balance.into(),
            tokens_per_sec,
            is_expirable,
        );

        self.process_action(&mut stream, ActionType::Init)?;

        self.stats_inc_stream_deposit(&stream.token_account_id, &initial_balance, &balance);
        self.stats_inc_streams(
            &stream.token_account_id,
            Contract::is_aurora_address(&stream.owner_id)
                | Contract::is_aurora_address(&stream.receiver_id),
        );

        if is_auto_start_enabled {
            self.process_action(&mut stream, ActionType::Start)?;
        }

        self.save_stream(stream)?;

        Ok(())
    }

    pub(crate) fn process_deposit(
        &mut self,
        token_account_id: AccountId,
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
            assert!(action.is_empty());
            self.save_stream(stream)?;
            return Err(ContractError::StreamExpired { stream_id });
        }

        if stream.token_account_id != token_account_id {
            return Err(ContractError::InvalidToken {
                expected: stream.token_account_id,
                received: token_account_id,
            });
        }

        if amount > MAX_AMOUNT || stream.balance + amount > MAX_AMOUNT {
            return Err(ContractError::ExceededMaxBalance {
                max_amount: MAX_AMOUNT,
            });
        }

        stream.balance += amount;

        self.save_stream(stream)?;

        self.stats_inc_stream_deposit(&token_account_id, &amount, &amount);

        Ok(())
    }

    pub fn process_start_stream(
        &mut self,
        sender_id: &AccountId,
        stream_id: CryptoHash,
    ) -> Result<(), ContractError> {
        let mut stream = self.extract_stream(&stream_id)?;

        if stream.owner_id != *sender_id {
            return Err(ContractError::CallerIsNotStreamOwner {
                expected: stream.owner_id,
                received: sender_id.clone(),
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

        self.save_stream(stream)?;

        Ok(())
    }

    pub fn process_pause_stream(
        &mut self,
        sender_id: &AccountId,
        stream_id: CryptoHash,
    ) -> Result<Vec<Promise>, ContractError> {
        let mut stream = self.extract_stream(&stream_id)?;

        if stream.owner_id != *sender_id && stream.receiver_id != *sender_id {
            return Err(ContractError::CallerIsNotStreamActor {
                owner: stream.owner_id,
                receiver: stream.receiver_id,
                caller: sender_id.clone(),
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

        self.save_stream(stream)?;

        Ok(promises)
    }

    pub fn process_stop_stream(
        &mut self,
        sender_id: &AccountId,
        stream_id: CryptoHash,
    ) -> Result<Vec<Promise>, ContractError> {
        let mut stream = self.extract_stream(&stream_id)?;

        if stream.owner_id != *sender_id && stream.receiver_id != *sender_id {
            return Err(ContractError::CallerIsNotStreamActor {
                owner: stream.owner_id,
                receiver: stream.receiver_id,
                caller: sender_id.clone(),
            });
        }
        if stream.status.is_terminated() {
            return Err(ContractError::CannotStopStream {
                stream_status: stream.status,
            });
        }

        let reason = if stream.owner_id == *sender_id {
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

        self.save_stream(stream)?;

        Ok(promises)
    }

    // TODO multiple
    pub fn process_withdraw(
        &mut self,
        sender_id: &AccountId,
        stream_id: CryptoHash,
        is_storage_deposit_needed: bool,
    ) -> Result<Vec<Promise>, ContractError> {
        let mut stream = self.extract_stream(&stream_id)?;

        let receiver_view = self.view_account(&stream.receiver_id)?;

        if receiver_view.id != *sender_id && !receiver_view.is_cron_allowed {
            return Err(ContractError::CronCallsForbidden {
                received: receiver_view.id,
            });
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

        self.save_stream(stream)?;

        Ok(promises)
    }
}
