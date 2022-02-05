use crate::*;

impl Contract {
    pub(crate) fn aurora_account_id() -> AccountId {
        AccountId::new_unchecked("aurora".to_string())
    }

    pub(crate) fn is_aurora_address(account_id: &AccountId) -> bool {
        // TODO check if aurora allows mixing uppercase and lowercase
        account_id.to_string().len() == 40
            && account_id
                .to_string()
                .chars()
                .all(|x| x.is_ascii_hexdigit())
    }

    pub(crate) fn aurora_transfer_call_msg(account_id: &AccountId) -> String {
        env::current_account_id().to_string() + ":" + &"0".repeat(64) + &account_id.to_string()
    }
}
