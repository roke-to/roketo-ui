use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Account {
    /// Graph of actual streams to enable quick search by AccountId
    pub inputs: UnorderedSet<StreamId>,
    pub outputs: UnorderedSet<StreamId>,

    /// Bridges to push streams further
    // TODO implement bridges
    pub bridges: Vector<(StreamId, StreamId)>,
    // TODO add stats
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct AccountView {
    pub inputs: Vec<StreamView>,
    pub outputs: Vec<StreamView>,
}

impl From<&Account> for AccountView {
    fn from(a: &Account) -> Self {
        let active_streams = Xyiming::streams();
        let finished_streams = Xyiming::finished();
        Self {
            inputs: a
                .inputs
                .iter()
                .map(|y| {
                    let mut stream_view: StreamView =
                        (&active_streams.get(&y).or(finished_streams.get(&y)).unwrap()).into();
                    stream_view.stream_id = y.into();
                    stream_view
                })
                .collect(),
            outputs: a
                .outputs
                .iter()
                .map(|y| {
                    let mut stream_view: StreamView =
                        (&active_streams.get(&y).or(finished_streams.get(&y)).unwrap()).into();
                    stream_view.stream_id = y.into();
                    stream_view
                })
                .collect(),
        }
    }
}

impl Account {
    // according to near-sdk/src/collections/unordered_set.rs
    pub(crate) fn add_input(&mut self, stream_id: &StreamId) {
        let res = self.inputs.insert(stream_id);
        assert!(res);
    }

    pub(crate) fn add_output(&mut self, stream_id: &StreamId) {
        let res = self.outputs.insert(stream_id);
        assert!(res);
    }
}

impl Xyiming {
    pub(crate) fn extract_account_or_create(&mut self, account_id: &AccountId) -> Account {
        Self::accounts().remove(&account_id).unwrap_or_else(|| {
            let mut prefix = Vec::with_capacity(33);
            prefix.push(b'x');
            prefix.extend(env::sha256(&account_id.as_bytes()));
            let mut prefix2 = Vec::with_capacity(33);
            prefix2.push(b'y');
            prefix2.extend(env::sha256(&account_id.as_bytes()));
            let mut prefix3 = Vec::with_capacity(33);
            prefix3.push(b'z');
            prefix3.extend(env::sha256(&account_id.as_bytes()));

            Account {
                inputs: UnorderedSet::new(prefix),
                outputs: UnorderedSet::new(prefix2),
                bridges: Vector::new(prefix3),
            }
        })
    }

    pub(crate) fn save_account_or_panic(&mut self, account_id: &AccountId, account: &Account) {
        assert!(Self::accounts().insert(account_id, account).is_none());
    }
}
