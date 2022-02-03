use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn dao_change_owner(&mut self, new_dao_id: AccountId) -> Result<(), ContractError> {
        self.dao.check_owner()?;

        self.dao.dao_id = new_dao_id.into();

        Ok(())
    }

    #[allow(unused_mut)]
    #[payable]
    pub fn dao_update_token(&mut self, mut token: Token) -> Result<(), ContractError> {
        self.dao.check_owner()?;

        if self.dao.tokens.remove(&token.account_id).is_none() {
            self.stats_add_token(token.account_id.clone());
        }
        // `is_listed` is skipped by serde
        token.is_listed = true;
        self.dao.tokens.insert(token.account_id.clone(), token);

        Ok(())
    }

    #[payable]
    pub fn dao_update_commission_unlisted(
        &mut self,
        commission_unlisted: U128,
    ) -> Result<(), ContractError> {
        self.dao.check_owner()?;

        self.dao.commission_unlisted = commission_unlisted.into();

        Ok(())
    }

    #[payable]
    pub fn dao_withdraw_ft(
        &mut self,
        token_account_id: AccountId,
        recipient: AccountId,
        amount: U128,
    ) -> Result<Promise, ContractError> {
        self.dao.check_owner()?;

        Ok(Contract::ft_transfer(
            self,
            &self.dao.get_token(&token_account_id)?,
            &recipient,
            amount.into(),
            Some(false),
        )?)
    }

    #[payable]
    pub fn dao_withdraw_near(
        &mut self,
        recipient: AccountId,
        amount: U128,
    ) -> Result<Promise, ContractError> {
        self.dao.check_owner()?;

        Ok(Promise::new(recipient.clone()).transfer(amount.into()))
    }

    #[payable]
    pub fn dao_add_exchanger(&mut self, new_exchanger_id: AccountId) -> Result<(), ContractError> {
        self.dao.check_owner()?;

        self.dao.exchangers.insert(new_exchanger_id);

        Ok(())
    }

    #[payable]
    pub fn dao_remove_exchanger(&mut self, exchanger_id: AccountId) -> Result<(), ContractError> {
        self.dao.check_owner()?;

        self.dao.exchangers.remove(&exchanger_id);

        Ok(())
    }
}
