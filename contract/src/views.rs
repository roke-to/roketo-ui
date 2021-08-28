use crate::*;

#[near_bindgen]
impl Xyiming {
    pub fn get_account(&self, account_id: ValidAccountId) -> Option<AccountView> {
        Self::accounts()
            .get(account_id.as_ref())
            .map(|a| (&a).into())
    }

    pub fn get_stream(&self, stream_id: StreamId) -> Option<StreamView> {
        Self::streams()
            .get(&stream_id)
            .map(|s| (&s).into())
            .or(Self::finished().get(&stream_id).map(|s| (&s).into()))
    }
}
