use crate::*;

#[near_bindgen]
impl Xyiming {
    pub fn get_account(&self, account_id: ValidAccountId) -> Option<AccountView> {
        Self::accounts()
            .get(account_id.as_ref())
            .map(|a| (&a).into())
    }

    pub fn get_bridge(&self, bridge_id: Base58CryptoHash) -> Option<BridgeView> {
        Self::bridges().get(&bridge_id.into()).map(|b| (&b).into())
    }

    pub fn get_stream(&self, stream_id: Base58CryptoHash) -> Option<StreamView> {
        Self::actual_streams()
            .get(&stream_id.into())
            .map(|s| (&s).into())
            .or(Self::terminated_streams()
                .get(&stream_id.into())
                .map(|s| (&s).into())
                .map(|mut s: StreamView| {
                    s.stream_id = stream_id;
                    s
                }))
    }
}
