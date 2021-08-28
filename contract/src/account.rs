use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Account {
    /// Graph of actual streams to enable quick search by AccountId
    pub inputs: TreeMap<AccountId, Vector<StreamId>>,
    pub outputs: TreeMap<AccountId, Vector<StreamId>>,

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
        let streams = Xyiming::streams();
        Self {
            inputs: a
                .inputs
                .iter()
                .map(|(_, x)| {
                    x.iter()
                        .map(|y| (&streams.get(&y).unwrap()).into())
                        .collect::<Vec<StreamView>>()
                })
                .flatten()
                .collect(),
            outputs: a
                .outputs
                .iter()
                .map(|(_, x)| {
                    x.iter()
                        .map(|y| (&streams.get(&y).unwrap()).into())
                        .collect::<Vec<StreamView>>()
                })
                .flatten()
                .collect(),
        }
    }
}

impl Account {
    pub(crate) fn add_input(
        &mut self,
        self_id: &AccountId,
        owner_id: &AccountId,
        stream_id: &StreamId,
    ) {
        let mut account_inputs = self.inputs.remove(owner_id).unwrap_or_else(|| {
            let mut prefix = Vec::with_capacity(65);
            prefix.push(b'w');
            prefix.extend(env::sha256(&self_id.as_bytes()));
            prefix.extend(env::sha256(&owner_id.as_bytes()));
            Vector::new(prefix)
        });

        account_inputs.push(stream_id);

        self.inputs.insert(owner_id, &account_inputs);
    }

    pub(crate) fn add_output(
        &mut self,
        self_id: &AccountId,
        receiver_id: &AccountId,
        stream_id: &StreamId,
    ) {
        let mut account_outputs = self.outputs.remove(receiver_id).unwrap_or_else(|| {
            let mut prefix = Vec::with_capacity(65);
            prefix.push(b'v');
            prefix.extend(env::sha256(&self_id.as_bytes()));
            prefix.extend(env::sha256(&receiver_id.as_bytes()));
            Vector::new(prefix)
        });

        account_outputs.push(stream_id);

        self.outputs.insert(receiver_id, &account_outputs);
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
                inputs: TreeMap::new(prefix),
                outputs: TreeMap::new(prefix2),
                bridges: Vector::new(prefix3),
            }
        })
    }

    pub(crate) fn save_account_or_panic(&mut self, account_id: &AccountId, account: &Account) {
        assert!(Self::accounts().insert(account_id, account).is_none());
    }
}
