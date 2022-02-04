use crate::*;

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum TransferCallRequest {
    Create { request: CreateRequest },
    Deposit { stream_id: Base58CryptoHash },
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct CreateRequest {
    pub description: Option<String>,
    pub receiver_id: AccountId,
    pub tokens_per_sec: Balance,
    pub is_auto_start_enabled: Option<bool>,
    pub is_expirable: Option<bool>,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum AuroraOperationalRequest {
    StartStream {
        stream_id: Base58CryptoHash,
    },
    PauseStream {
        stream_id: Base58CryptoHash,
    },
    StopStream {
        stream_id: Base58CryptoHash,
    },
    Withdraw {
        stream_id: Base58CryptoHash,
        is_storage_deposit_needed: bool,
    },
}

#[near_bindgen]
impl FungibleTokenReceiver for Contract {
    // NEP-141 interface
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        if env::predecessor_account_id() == Contract::aurora_account_id() {
            // Try to parse as an Aurora operational request
            let key: Result<AuroraOperationalRequest, _> = serde_json::from_str(&msg);
            if key.is_ok() {
                // TODO
                /*let eth_needed: Balance = DEFAULT_STORAGE_BALANCE
                * self.dao.storage_deposit_aurora_numerator as u128
                / self.dao.storage_deposit_aurora_denominator as u128;*/
                let res = match key.as_ref().unwrap() {
                    AuroraOperationalRequest::StartStream { stream_id } => self
                        .process_start_stream((*stream_id).into())
                        .map(|_| vec![]),
                    AuroraOperationalRequest::PauseStream { stream_id } => {
                        // TODO
                        /*if u128::from(amount) < eth_needed {
                            Err(ContractError::InsufficientDeposit {
                                expected: eth_needed,
                                received: amount.into(),
                            })
                        } else {
                            self.process_pause_stream((*stream_id).into())
                        }*/
                        self.process_pause_stream((*stream_id).into())
                    }
                    AuroraOperationalRequest::StopStream { stream_id } => {
                        // TODO
                        /*let stream_view = self.view_stream(&stream_id)?;
                        let token = self
                            .dao
                            .get_token(&stream_view.token_account_id)
                            .unwrap_or(Token::new_unlisted(&stream_view.token_account_id));
                        // In case of token.storage_balance_needed == 0, it should be at least 1 yocto
                        if env::attached_deposit() < 2 * token.storage_balance_needed + 1 {
                            return Err(ContractError::InsufficientDeposit {
                                expected: 2 * token.storage_balance_needed + 1,
                                received: env::attached_deposit(),
                            });
                        }*/
                        self.process_stop_stream((*stream_id).into())
                    }
                    AuroraOperationalRequest::Withdraw {
                        stream_id,
                        is_storage_deposit_needed,
                    } => {
                        // TODO storage_deposit question must be discussed
                        // with Aurora team
                        self.process_withdraw((*stream_id).into(), *is_storage_deposit_needed)
                    }
                };
                return match res {
                    Ok(promises) => {
                        log!(
                            "Success on {:?}, {:?} promises started",
                            key,
                            promises.len()
                        );
                        PromiseOrValue::Value(U128::from(0))
                    }
                    Err(err) => {
                        panic!("Error {:?} on {:?}", err, key);
                    }
                };
            } else {
                // It still can be a TransferCallRequest
            }
        }

        let token = self
            .dao
            .get_token(&env::predecessor_account_id())
            .unwrap_or(Token::new_unlisted(&sender_id));
        let key: Result<TransferCallRequest, _> = serde_json::from_str(&msg);
        if key.is_err() {
            log!("cannot parse message {:?}, error {:?}", msg, key);
            // return everything back
            return PromiseOrValue::Value(amount);
        }
        match key.unwrap() {
            TransferCallRequest::Create { request } => {
                match self.process_create_stream(
                    sender_id,
                    request.description,
                    request.receiver_id,
                    token,
                    amount.into(),
                    request.tokens_per_sec,
                    request.is_auto_start_enabled,
                    request.is_expirable,
                ) {
                    Ok(()) => PromiseOrValue::Value(U128::from(0)),
                    Err(err) => panic!("error on stream creation, {:?}", err),
                    // TODO test panic doens't apply state and returns value back
                }
            }
            TransferCallRequest::Deposit { stream_id } => {
                match self.process_deposit(token, stream_id.into(), amount.into()) {
                    Ok(()) => PromiseOrValue::Value(U128::from(0)),
                    Err(err) => panic!("error on stream depositing, {:?}", err),
                }
            }
        }
    }
}
