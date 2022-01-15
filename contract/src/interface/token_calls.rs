use crate::*;

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum TransferCallRequest {
    Create(CreateStruct),
    Deposit(Base58CryptoHash),
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct CreateStruct {
    pub description: Option<String>,
    pub receiver_id: AccountId,
    pub token_name: String,
    pub tokens_per_tick: Balance,
    pub is_auto_start_enabled: Option<bool>,
    pub is_expirable: Option<bool>,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum AuroraOperationalRequest {
    StartStream(Base58CryptoHash),
    PauseStream(Base58CryptoHash),
    StopStream(Base58CryptoHash),
    Withdraw(Base58CryptoHash),
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
                let res = match key.as_ref().unwrap() {
                    AuroraOperationalRequest::StartStream(stream_id) => {
                        self.process_start_stream((*stream_id).into())
                    }
                    AuroraOperationalRequest::PauseStream(stream_id) => {
                        self.process_pause_stream((*stream_id).into())
                    }
                    AuroraOperationalRequest::StopStream(stream_id) => {
                        self.process_stop_stream((*stream_id).into())
                    }
                    AuroraOperationalRequest::Withdraw(stream_id) => {
                        self.process_withdraw((*stream_id).into())
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
                        log!("Error {:?} on {:?}", err, key);
                        // return everything back
                        return PromiseOrValue::Value(amount);
                    }
                };
            } else {
                // It still can be a TransferCallRequest
            }
        }

        let token = match self.dao.get_token(&env::predecessor_account_id()) {
            Ok(token) => token,
            Err(_) => Token::new_unlisted(&sender_id),
        };
        let key: Result<TransferCallRequest, _> = serde_json::from_str(&msg);
        if key.is_err() {
            log!("cannot parse message {:?}, error {:?}", msg, key);
            // return everything back
            return PromiseOrValue::Value(amount);
        }
        match key.unwrap() {
            TransferCallRequest::Create(create_struct) => {
                match self.process_create_stream(
                    sender_id,
                    create_struct.description,
                    create_struct.receiver_id,
                    token,
                    amount.into(),
                    create_struct.tokens_per_tick,
                    create_struct.is_auto_start_enabled,
                    create_struct.is_expirable,
                ) {
                    Ok(()) => PromiseOrValue::Value(U128::from(0)),
                    Err(err) => {
                        log!("error on stream creation, {:?}", err);
                        // return everything back
                        PromiseOrValue::Value(amount)
                    }
                }
            }
            TransferCallRequest::Deposit(stream_id) => {
                match self.process_deposit(token, stream_id.into(), amount.into()) {
                    Ok(()) => PromiseOrValue::Value(U128::from(0)),
                    Err(err) => {
                        log!("error on stream depositing, {:?}", err);
                        // return everything back
                        PromiseOrValue::Value(amount)
                    }
                }
            }
        }
    }
}
