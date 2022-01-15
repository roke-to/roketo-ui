use crate::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Account {
    pub id: AccountId,

    pub active_streams: UnorderedSet<StreamId>,
    pub inactive_streams: UnorderedSet<StreamId>,

    pub total_incoming: HashMap<AccountId, Balance>,
    pub total_outgoing: HashMap<AccountId, Balance>,
    pub total_received: HashMap<AccountId, Balance>,

    pub deposit: Balance,

    pub is_cron_allowed: bool,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum VAccount {
    Current(Account),
}

impl From<VAccount> for Account {
    fn from(v: VAccount) -> Self {
        match v {
            VAccount::Current(c) => c,
        }
    }
}

impl From<Account> for VAccount {
    fn from(c: Account) -> Self {
        VAccount::Current(c)
    }
}

impl Contract {
    pub(crate) fn extract_account(
        &mut self,
        account_id: &AccountId,
    ) -> Result<Account, ContractError> {
        match self.accounts.remove(&account_id) {
            Some(vaccount) => Ok(vaccount.into()),
            None => Err(ContractError::UnreachableAccount {
                account_id: (*account_id).clone(),
            }),
        }
    }

    pub(crate) fn extract_account_or_create(&mut self, account_id: &AccountId) -> Account {
        self.extract_account(&account_id).unwrap_or({
            self.stats_inc_accounts();
            Account {
                id: account_id.clone(),
                active_streams: UnorderedSet::new(StorageKey::ActiveStreams {
                    account_id: account_id.clone(),
                }),
                inactive_streams: UnorderedSet::new(StorageKey::InactiveStreams {
                    account_id: account_id.clone(),
                }),
                total_incoming: HashMap::new(),
                total_outgoing: HashMap::new(),
                total_received: HashMap::new(),
                deposit: 0,
                is_cron_allowed: false,
            }
        })
    }

    pub(crate) fn save_account(
        &mut self,
        account_id: &AccountId,
        account: Account,
    ) -> Result<(), ContractError> {
        if *account_id != account.id {
            return Err(ContractError::DataCorruption);
        }
        match self.accounts.insert(account_id, &account.into()) {
            None => Ok(()),
            Some(_) => Err(ContractError::DataCorruption),
        }
    }
}
