use crate::*;

impl Contract {
    pub(crate) fn aurora_account_id() -> AccountId {
        AccountId::new_unchecked("aurora".to_string())
    }

    pub(crate) fn is_aurora_address(account_id: &AccountId) -> bool {
        // TODO check hex
        account_id.to_string().len() == 40
    }

    pub(crate) fn aurora_transfer_call_msg(account_id: &AccountId) -> String {
        // TODO replace to actual contract name
        "roketodapp.near:0000000000000000000000000000000000000000000000000000000000000000"
            .to_owned()
            + &account_id.to_string()
    }
}
