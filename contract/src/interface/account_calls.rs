use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn account_update_cron_flag(&mut self, is_cron_allowed: bool) -> Result<(), ContractError> {
        let mut owner = self.extract_account(&env::predecessor_account_id())?;
        owner.is_cron_allowed = is_cron_allowed;
        self.save_account(&env::predecessor_account_id(), owner)
    }

    #[payable]
    pub fn account_deposit_near(&mut self) -> Result<(), ContractError> {
        let mut owner = self.extract_account_or_create(&env::predecessor_account_id());
        if owner.deposit + env::attached_deposit() < self.dao.commission_unlisted {
            return Err(ContractError::InsufficientDeposit {
                expected: self.dao.commission_unlisted - owner.deposit,
                received: env::attached_deposit(),
            });
        }
        owner.deposit += env::attached_deposit();
        self.save_account(&env::predecessor_account_id(), owner)
    }
}
