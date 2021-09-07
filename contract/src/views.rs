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

    pub fn get_stream_history(&self, stream_id: Base58CryptoHash, from: usize, to: usize) -> Vec<ActionView> {
        let h = Self::streams().get(&stream_id.into()).unwrap().history.to_vec();
        let mut res = vec![];
        let from = std::cmp::min(from, h.len());
        let to = std::cmp::min(to, h.len());
        for i in from..to {
            res.push((&h[i]).into())
        }
        res
    }
}
