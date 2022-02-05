use crate::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Account {
    pub id: AccountId,

    pub active_incoming_streams: UnorderedSet<StreamId>,
    pub active_outgoing_streams: UnorderedSet<StreamId>,

    pub inactive_incoming_streams: UnorderedSet<StreamId>,
    pub inactive_outgoing_streams: UnorderedSet<StreamId>,

    pub total_incoming: HashMap<AccountId, Balance>,
    pub total_outgoing: HashMap<AccountId, Balance>,
    pub total_received: HashMap<AccountId, Balance>,

    pub deposit: Balance,

    pub stake: Balance,

    pub last_created_stream: Option<StreamId>,
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
    pub(crate) fn view_account(
        &mut self,
        account_id: &AccountId,
    ) -> Result<Account, ContractError> {
        match self.accounts.get(&account_id) {
            Some(vaccount) => Ok(vaccount.into()),
            None => Err(ContractError::UnreachableAccount {
                account_id: (*account_id).clone(),
            }),
        }
    }

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
            self.stats_inc_accounts(Contract::is_aurora_address(account_id));
            Account {
                id: account_id.clone(),
                active_incoming_streams: UnorderedSet::new(StorageKey::ActiveIncomingStreams {
                    account_id: account_id.clone(),
                }),
                active_outgoing_streams: UnorderedSet::new(StorageKey::ActiveOutgoingStreams {
                    account_id: account_id.clone(),
                }),
                inactive_incoming_streams: UnorderedSet::new(StorageKey::InactiveIncomingStreams {
                    account_id: account_id.clone(),
                }),
                inactive_outgoing_streams: UnorderedSet::new(StorageKey::InactiveOutgoingStreams {
                    account_id: account_id.clone(),
                }),
                total_incoming: HashMap::new(),
                total_outgoing: HashMap::new(),
                total_received: HashMap::new(),
                deposit: 0,
                stake: 0,
                last_created_stream: None,
                is_cron_allowed: false,
            }
        })
    }

    pub(crate) fn save_account(&mut self, account: Account) -> Result<(), ContractError> {
        match self.accounts.insert(&account.id.clone(), &account.into()) {
            None => Ok(()),
            Some(_) => Err(ContractError::DataCorruption),
        }
    }
}
