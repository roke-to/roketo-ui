use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn account_update_cron_flag(&mut self, is_cron_allowed: bool) {
        let mut owner = self
            .extract_account(&env::predecessor_account_id())
            .unwrap();
        owner.is_cron_allowed = is_cron_allowed;
        self.save_account(&env::predecessor_account_id(), owner)
            .unwrap()
    }

    #[payable]
    pub fn account_deposit_near(&mut self) {
        self.account_deposit(env::predecessor_account_id(), env::attached_deposit())
            .unwrap();
        self.stats_inc_account_deposit(&env::attached_deposit(), false);
    }
}

impl Contract {
    pub fn account_deposit(
        &mut self,
        account_id: AccountId,
        deposit: Balance,
    ) -> Result<(), ContractError> {
        let mut account = self.extract_account_or_create(&account_id);
        if account.deposit + deposit < self.dao.commission_unlisted {
            return Err(ContractError::InsufficientNearDeposit {
                expected: self.dao.commission_unlisted - account.deposit,
                received: deposit,
            });
        }
        account.deposit += deposit;
        self.save_account(&account_id, account)
    }
}
