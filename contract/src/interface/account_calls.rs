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
        let mut owner = self.extract_account_or_create(&env::predecessor_account_id());
        assert!(owner.deposit + env::attached_deposit() >= self.dao.commission_unlisted);
        owner.deposit += env::attached_deposit();
        self.save_account(&env::predecessor_account_id(), owner)
            .unwrap()
    }
}
