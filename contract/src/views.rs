use crate::*;

#[near_bindgen]
impl Xyiming {
    pub fn get_account(&self, account_id: ValidAccountId) -> Option<AccountView> {
        Self::accounts()
            .get(account_id.as_ref())
            .map(|a| (&a).into())
    }

    pub fn get_stream(&self, stream_id: Base58CryptoHash) -> Option<StreamView> {
        Self::streams()
            .get(&stream_id.into())
            .map(|s| (&s).into())
            .map(|mut s: StreamView| {
                s.stream_id = Some(stream_id);
                s
            })
    }
}
