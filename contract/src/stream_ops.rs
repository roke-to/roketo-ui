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
            return Err(ContractError::StreamTerminated {
                stream_id: stream_id.into(),
            });
        }

        if stream.available_to_withdraw() == stream.balance
            && stream.balance > 0
            && stream.is_expirable
        {
            debug_assert!(self
                .process_action(
                    &mut stream,
                    ActionType::Stop {
                        reason: StreamFinishReason::FinishedBecauseCannotBeExtended,
                    },
                )?
                .is_empty());
            self.save_stream(&stream_id, stream)?;
            return Err(ContractError::StreamExpired {
                stream_id: stream_id.into(),
            });
        }

        if stream.token_account_id != token.account_id {
            return Err(ContractError::InvalidToken {
                expected: stream.token_account_id,
                received: token.account_id,
            });
        }

        stream.balance += amount;

        self.save_stream(&stream_id, stream)?;

        Ok(())
    }

    pub fn process_start_stream(
        &mut self,
        stream_id: CryptoHash,
    ) -> Result<Vec<Promise>, ContractError> {
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

        let promises = self.process_action(&mut stream, ActionType::Start)?;
        // There must be no promises at the point,
        // but if they appeared somehow it's better to transmit than to hide.

        self.save_stream(&stream_id, stream)?;

        Ok(promises)
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
    ) -> Result<Vec<Promise>, ContractError> {
        let mut stream = self.extract_stream(&stream_id)?;

        let receiver_view: Account = self.accounts.get(&stream.receiver_id).unwrap().into();

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

        let promises = self.process_action(&mut stream, ActionType::Withdraw)?;

        self.save_stream(&stream_id, stream)?;

        Ok(promises)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::test_env::{alice, bob, carol};
    use near_sdk::{env, test_utils::VMContextBuilder, testing_env};

    fn new_stream() -> Stream {
        Stream {
            id: env::sha256(&[44, 55, 66]).as_slice().try_into().unwrap(),
            description: Some("blah".to_string()),
            owner_id: alice(),
            receiver_id: bob(),
            token_account_id: "token.near".parse().unwrap(),
            timestamp_created: env::block_timestamp(),
            last_action: env::block_timestamp(),
            balance: 1_000_000_000_000_000_000_000_000_000, // 1e27
            tokens_per_sec: 1_000_000_000_000_000_000_000_000, // 1e24
            status: StreamStatus::Active,
            tokens_total_withdrawn: 0,
            is_expirable: true,
        }
    }

    #[test]
    fn test_save_extract_stream() {
        let mut contract = Contract::new("dao.near".parse().unwrap());
        let stream_id = new_stream().id;
        assert!(contract.extract_stream(&stream_id).is_err());
        assert!(contract
            .save_stream(
                &env::sha256(&[44, 55]).as_slice().try_into().unwrap(),
                new_stream()
            )
            .is_err());
        assert!(contract
            .save_stream(&stream_id.clone(), new_stream())
            .is_ok());
        assert!(contract
            .save_stream(&stream_id.clone(), new_stream())
            .is_err());
        assert!(contract.extract_stream(&stream_id).is_ok());
        assert!(contract.extract_stream(&stream_id).is_err());
    }

    #[test]
    fn test_create_stream() {
        let mut contract = Contract::new("dao.near".parse().unwrap());
        testing_env!(VMContextBuilder::new().signer_account_id(carol()).build());
        let stream = new_stream();
        assert_eq!(
            contract.process_create_stream(
                stream.owner_id,
                stream.description,
                stream.receiver_id,
                Token::new_unlisted(&stream.token_account_id),
                stream.balance,
                stream.tokens_per_sec,
                None,
                None,
            ),
            Err(ContractError::UnreachableAccount {
                account_id: carol()
            })
        );

        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(carol())
            .attached_deposit(DEFAULT_COMMISSION_UNLISTED)
            .build());
        contract.account_deposit_near().unwrap();
        let stream = new_stream();
        testing_env!(VMContextBuilder::new().signer_account_id(carol()).build());
        assert!(contract
            .process_create_stream(
                stream.owner_id,
                stream.description,
                stream.receiver_id,
                Token::new_unlisted(&stream.token_account_id),
                stream.balance,
                stream.tokens_per_sec,
                None,
                None,
            )
            .is_ok());
    }

    #[test]
    fn test_create_stream_to_aurora() {
        let mut contract = Contract::new("dao.near".parse().unwrap());
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(carol())
            .attached_deposit(DEFAULT_COMMISSION_UNLISTED)
            .build());
        contract.account_deposit_near().unwrap();
        let mut stream = new_stream();
        stream.receiver_id =
            AccountId::new_unchecked("f5cfbc74057c610c8ef151a439252680ac68c6dc".to_string());
        testing_env!(VMContextBuilder::new().signer_account_id(carol()).build());
        assert!(contract
            .process_create_stream(
                stream.owner_id,
                stream.description,
                stream.receiver_id,
                Token::new_unlisted(&stream.token_account_id),
                stream.balance,
                stream.tokens_per_sec,
                None,
                None,
            )
            .is_ok());
    }
}
