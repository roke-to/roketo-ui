use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[cfg_attr(not(target_arch = "wasm32"), derive(Debug))]
#[serde(crate = "near_sdk::serde")]
pub struct Dao {
    pub dao_id: AccountId,

    pub tokens: HashMap<AccountId, Token>,
    #[serde(with = "u128_dec_format")]
    pub commission_unlisted: Balance,

    pub utility_token_id: AccountId,
    pub utility_token_decimals: u8,

    // Related to charges in Aurora
    pub eth_near_ratio: SafeFloat,

    pub exchangers: HashSet<AccountId>,
}

impl Dao {
    pub(crate) fn new(
        dao_id: AccountId,
        utility_token_id: AccountId,
        utility_token_decimals: u8,
    ) -> Self {
        Self {
            dao_id,
            tokens: HashMap::new(),
            commission_unlisted: DEFAULT_COMMISSION_UNLISTED,
            utility_token_id,
            utility_token_decimals,
            eth_near_ratio: SafeFloat::ZERO,
            exchangers: HashSet::new(),
        }
    }

    pub(crate) fn check_owner(&self) -> Result<(), ContractError> {
        if env::signer_account_id() == self.dao_id {
            Ok(())
        } else {
            Err(ContractError::CallerIsNotDao {
                expected: self.dao_id.clone(),
                received: env::signer_account_id(),
            })
        }
    }

    pub(crate) fn get_token_or_unlisted(&self, token_account_id: &AccountId) -> Token {
        self.get_token(token_account_id)
            .unwrap_or(Token::new_unlisted(token_account_id))
    }

    pub(crate) fn get_token(&self, token_account_id: &AccountId) -> Result<Token, ContractError> {
        match self.tokens.get(token_account_id) {
            Some(token) => Ok(token.clone()),
            None => Err(ContractError::UnknownToken {
                received: token_account_id.clone(),
            }),
        }
    }

    pub(crate) fn check_exchanger(&self, sender_id: &AccountId) -> Result<(), ContractError> {
        match self.exchangers.get(sender_id) {
            Some(_) => Ok(()),
            None => Err(ContractError::UnknownExchanger {
                received: sender_id.clone(),
            }),
        }
    }
}
