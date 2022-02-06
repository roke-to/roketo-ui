use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn account_update_cron_flag(&mut self, is_cron_allowed: bool) {
        assert_one_yocto();
        let mut account = self
            .extract_account(&env::predecessor_account_id())
            .unwrap();
        account.is_cron_allowed = is_cron_allowed;
        self.save_account(account).unwrap()
    }

    #[payable]
    pub fn account_deposit_near(&mut self) {
        self.account_deposit(env::predecessor_account_id(), env::attached_deposit())
            .unwrap();
        self.stats_inc_account_deposit(&env::attached_deposit(), false);
    }

    #[payable]
    pub fn account_unstake(&mut self, amount: Balance) -> Promise {
        assert_one_yocto();
        let mut account = self
            .extract_account(&env::predecessor_account_id())
            .unwrap();
        assert!(amount > 0);
        assert!(account.stake >= amount);
        account.stake -= amount;
        self.save_account(account).unwrap();

        assert!(env::prepaid_gas() - env::used_gas() >= MIN_GAS_FOR_PROCESS_ACTION);

        self.ft_transfer(
            &self.dao.get_token_or_unlisted(&self.dao.utility_token_id),
            &env::predecessor_account_id(),
            amount,
            false,
        )
        .unwrap()
    }
}

impl Contract {
    pub(crate) fn account_deposit(
        &mut self,
        account_id: AccountId,
        deposit: Balance,
    ) -> Result<(), ContractError> {
        self.create_account_if_not_exist(&account_id)?;
        let mut account = self.extract_account(&account_id)?;
        if account.deposit + deposit < self.dao.commission_unlisted {
            return Err(ContractError::InsufficientNearDeposit {
                expected: self.dao.commission_unlisted - account.deposit,
                received: deposit,
            });
        }
        account.deposit += deposit;
        self.save_account(account)
    }
}
