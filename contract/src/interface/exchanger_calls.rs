use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn exchanger_update_commission_on_create(
        &mut self,
        token_account_id: AccountId,
        commission_on_create: U128,
    ) -> Result<(), ContractError> {
        self.dao.check_exchanger(&env::predecessor_account_id())?;

        let mut token = self.dao.get_token(&token_account_id)?;
        token.commission_on_create = commission_on_create.into();
        self.dao.tokens.insert(token_account_id, token);

        Ok(())
    }

    #[payable]
    pub fn exchanger_update_storage_deposit_aurora_coefficient(
        &mut self,
        storage_deposit_aurora_numerator: u32,
        storage_deposit_aurora_denominator: u32,
    ) -> Result<(), ContractError> {
        self.dao.check_exchanger(&env::predecessor_account_id())?;

        self.dao.storage_deposit_aurora_numerator = storage_deposit_aurora_numerator;
        self.dao.storage_deposit_aurora_denominator = storage_deposit_aurora_denominator;

        Ok(())
    }

    #[payable]
    pub fn exchanger_withdraw_ft(
        &mut self,
        token_account_id: AccountId,
        amount: U128,
    ) -> Result<Promise, ContractError> {
        self.dao.check_exchanger(&env::predecessor_account_id())?;

        let amount = amount.into();
        let mut token = self.dao.get_token(&token_account_id)?;
        if amount > token.collected_commission {
            return Err(ContractError::InsufficientBalance {
                token_account_id,
                requested: amount,
                left: token.collected_commission,
            });
        }
        token.collected_commission -= amount;
        self.dao.tokens.insert(token_account_id, token.clone());

        // In case of gas failure ask DAO to refund
        // and be smarter next time, dickhead
        Ok(Contract::ft_transfer(
            self,
            &token,
            &env::predecessor_account_id(),
            amount,
            false,
        )?)
    }
}
