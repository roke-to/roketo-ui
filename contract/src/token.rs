use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[cfg_attr(not(target_arch = "wasm32"), derive(Debug))]
#[serde(crate = "near_sdk::serde")]
pub struct Token {
    pub account_id: AccountId,

    #[serde(skip)]
    pub is_listed: bool,

    // taken in current fts in case of listed token
    #[serde(with = "u128_dec_format")]
    pub commission_on_create: Balance,

    // percentage of tokens taken for commission
    pub commission_numerator: u32,
    pub commission_denominator: u32,

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
        let commission =
            amount / self.commission_denominator as Balance * self.commission_numerator as Balance;
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
        is_storage_deposit_needed: bool,
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
            if env::prepaid_gas() - env::used_gas() < MIN_GAS_FOR_AURORA_TRANFSER {
                return Err(ContractError::InsufficientGas {
                    expected: MIN_GAS_FOR_AURORA_TRANFSER,
                    left: env::prepaid_gas() - env::used_gas(),
                });
            }
            if token.account_id == Contract::aurora_account_id() {
                return Ok(ext_fungible_token::ft_transfer_call(
                    Contract::aurora_account_id(),
                    U128(amount),
                    None,
                    Contract::aurora_transfer_call_msg(recipient),
                    Contract::aurora_account_id(),
                    ONE_YOCTO,
                    token.gas_for_ft_transfer,
                ));
            } else {
                return Ok(ext_fungible_token::ft_transfer_call(
                    Contract::aurora_account_id(),
                    U128(amount),
                    None,
                    recipient.to_string(),
                    token.account_id.clone(),
                    ONE_YOCTO,
                    token.gas_for_ft_transfer,
                ));
            }
        }

        if is_storage_deposit_needed {
            if env::prepaid_gas() - env::used_gas()
                < token.gas_for_ft_transfer + token.gas_for_storage_deposit
            {
                return Err(ContractError::InsufficientGas {
                    expected: token.gas_for_ft_transfer + token.gas_for_storage_deposit,
                    left: env::prepaid_gas() - env::used_gas(),
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
