use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[cfg_attr(not(target_arch = "wasm32"), derive(Debug))]
#[serde(crate = "near_sdk::serde")]
pub struct Token {
    pub account_id: AccountId,

    pub is_listed: bool,

    // taken in current fts in case of listed token
    #[serde(with = "u128_dec_format")]
    pub commission_on_create: Balance,

    // percentage of tokens taken for commission
    #[serde(with = "u128_dec_format")]
    pub commission_numerator: u128,
    #[serde(with = "u128_dec_format")]
    pub commission_denominator: u128,

    #[serde(with = "u128_dec_format")]
    pub collected_commission: Balance,

    #[serde(with = "u128_dec_format")]
    pub storage_balance_needed: Balance,

    pub gas_for_ft_transfer: Gas,
    pub gas_for_storage_deposit: Gas,
}

impl Token {
    pub(crate) fn new_unlisted(token_account_id: &AccountId) -> Self {
        Self {
            account_id: token_account_id.clone(),
            is_listed: false,
            commission_on_create: 0, // we don't accept unlisted tokens
            commission_numerator: 0,
            commission_denominator: 1,
            collected_commission: 0,
            storage_balance_needed: DEFAULT_STORAGE_BALANCE,
            gas_for_ft_transfer: DEFAULT_GAS_FOR_FT_TRANSFER,
            gas_for_storage_deposit: DEFAULT_GAS_FOR_STORAGE_DEPOSIT,
        }
    }

    pub(crate) fn apply_commission(&self, amount: Balance) -> (Balance, Balance) {
        let commission = amount / self.commission_denominator * self.commission_numerator;
        (amount - commission, commission)
    }
}

#[ext_contract]
pub trait FungibleTokenContract {
    fn storage_deposit(
        &mut self,
        account_id: Option<AccountId>,
        registration_only: Option<bool>,
    ) -> StorageBalance;
}

impl Contract {
    pub(crate) fn ft_transfer(
        &self,
        token: &Token,
        recipient: &AccountId,
        amount: Balance,
        is_storage_deposit_needed: Option<bool>,
    ) -> Result<Promise, ContractError> {
        if amount == 0 {
            // NEP-141 forbids zero token transfers
            //
            // It's safe to return Err here because
            // transfers are allowed only for active streams,
            // and active streams guaranteed to have
            // non-zero balance.
            return Err(ContractError::ZeroTokenTransfer);
        }

        if Contract::is_aurora_address(recipient) {
            debug_assert!(is_storage_deposit_needed.is_none());
            if env::prepaid_gas() - env::used_gas() < MIN_GAS_FOR_AURORA_TRANFSER {
                return Err(ContractError::InsufficientGas {
                    expected: MIN_GAS_FOR_AURORA_TRANFSER,
                    left: env::prepaid_gas() - env::used_gas(),
                });
            }
            if token.account_id == Contract::aurora_account_id() {
                return Ok(ext_fungible_token::ft_transfer_call(
                    recipient.clone(),
                    U128(amount),
                    None,
                    Contract::aurora_transfer_call_msg(recipient),
                    token.account_id.clone(),
                    ONE_YOCTO,
                    token.gas_for_ft_transfer,
                ));
            } else {
                return Ok(ext_fungible_token::ft_transfer_call(
                    recipient.clone(),
                    U128(amount),
                    None,
                    recipient.to_string(),
                    token.account_id.clone(),
                    ONE_YOCTO,
                    token.gas_for_ft_transfer,
                ));
            }
        }

        let is_storage_deposit_needed = match is_storage_deposit_needed {
            Some(value) => value,
            None => true,
        };

        if is_storage_deposit_needed {
            if env::prepaid_gas() - env::used_gas()
                < token.gas_for_ft_transfer + token.gas_for_storage_deposit
            {
                return Err(ContractError::InsufficientGas {
                    expected: token.gas_for_ft_transfer + token.gas_for_storage_deposit,
                    left: env::prepaid_gas() - env::used_gas(),
                });
            }
            if env::attached_deposit() < token.storage_balance_needed {
                return Err(ContractError::InsufficientDeposit {
                    expected: token.storage_balance_needed,
                    received: env::attached_deposit(),
                });
            }
            Ok(fungible_token_contract::storage_deposit(
                Some(recipient.clone()),
                Some(true),
                token.account_id.clone(),
                token.storage_balance_needed,
                token.gas_for_storage_deposit,
            )
            .then(ext_fungible_token::ft_transfer(
                recipient.clone(),
                U128(amount),
                None,
                token.account_id.clone(),
                ONE_YOCTO,
                token.gas_for_ft_transfer,
            )))
        } else {
            if env::prepaid_gas() - env::used_gas() < token.gas_for_ft_transfer {
                return Err(ContractError::InsufficientGas {
                    expected: token.gas_for_ft_transfer,
                    left: env::prepaid_gas() - env::used_gas(),
                });
            }
            Ok(ext_fungible_token::ft_transfer(
                recipient.clone(),
                U128(amount),
                None,
                token.account_id.clone(),
                ONE_YOCTO,
                token.gas_for_ft_transfer,
            ))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_commission_unlisted() {
        let token = Token::new_unlisted(&"token.near".parse().unwrap());
        let balance: Balance = 1000000000;
        let (left, commission) = token.apply_commission(balance);
        assert_eq!(left, balance);
        assert_eq!(commission, 0);
        assert_eq!(balance, left + commission);
    }

    #[test]
    fn test_commission_1_percent() {
        let mut token = Token::new_unlisted(&"token.near".parse().unwrap());
        token.commission_numerator = 1;
        token.commission_denominator = 100;
        let balance: Balance = 1000000000;
        let (left, commission) = token.apply_commission(balance);
        assert_eq!(left, balance / 100 * 99);
        assert_eq!(commission, balance / 100);
        assert_eq!(balance, left + commission);
    }

    #[test]
    fn test_commission_100_percent() {
        let mut token = Token::new_unlisted(&"token.near".parse().unwrap());
        token.commission_numerator = 1;
        token.commission_denominator = 1;
        let balance: Balance = 123456;
        let (left, commission) = token.apply_commission(balance);
        assert_eq!(left, 0);
        assert_eq!(commission, balance);
        assert_eq!(balance, left + commission);
    }

    #[test]
    fn test_transfer_to_aurora() {
        let contract = Contract::new("dao.near".parse().unwrap());
        let aurora_address =
            AccountId::new_unchecked("f5cfbc74057c610c8ef151a439252680ac68c6dc".to_string());
        assert!(Contract::is_aurora_address(&aurora_address));
        assert!(contract
            .ft_transfer(
                &Token::new_unlisted(&"token.near".parse().unwrap()),
                &aurora_address,
                123456,
                None
            )
            .is_ok());
        assert!(contract
            .ft_transfer(
                &Token::new_unlisted(&Contract::aurora_account_id()),
                &aurora_address,
                123456,
                None
            )
            .is_ok());
    }
}
