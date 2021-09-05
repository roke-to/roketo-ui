use std::collections::HashMap;

use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Account {
    pub account_id: AccountId,
    /// Graph of actual streams to enable quick search by AccountId
    pub inputs: UnorderedSet<StreamId>,
    pub outputs: UnorderedSet<StreamId>,

    pub last_action: Timestamp,

    pub cron_calls_enabled: bool,
    // TODO add stats
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct AccountView {
    pub account_id: String,
    pub inputs: Vec<StreamView>,
    pub outputs: Vec<StreamView>,
    pub last_action: WrappedTimestamp,
    pub cron_calls_enabled: bool,
}

impl From<&Account> for AccountView {
    fn from(a: &Account) -> Self {
        let streams = Xyiming::streams();
        Self {
            account_id: a.account_id.clone(),
            inputs: a
                .inputs
                .iter()
                .map(|x| {
                    let mut stream_view: StreamView = (&streams
                        .get(&x)
                        .unwrap())
                        .into();
                    stream_view.stream_id = Some(x.into());
                    stream_view
                })
                .collect(),
            outputs: a
                .outputs
                .iter()
                .map(|x| {
                    let mut stream_view: StreamView = (&streams
                        .get(&x)
                        .unwrap())
                        .into();
                    stream_view.stream_id = Some(x.into());
                    stream_view
                })
                .collect(),
            last_action: a.last_action.into(),
            cron_calls_enabled: a.cron_calls_enabled,
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

    pub(crate) fn update_state(&mut self) -> Vec<Promise> {
        let mut tokens_left = HashMap::<TokenId, Balance>::new();
        if self.last_action != env::block_timestamp() {

            for input_stream_id in self.inputs.iter() {
                let mut input_stream = Xyiming::extract_stream_or_panic(&input_stream_id);
                if input_stream.status != StreamStatus::Active {
                    Xyiming::streams().insert(&input_stream_id, &input_stream);
                    continue;
                }
                let payment = input_stream.process_withdraw(self.last_action);
                Xyiming::streams().insert(&input_stream_id, &input_stream);
                tokens_left.insert(input_stream.token_id, payment);
            }

            for output_stream_id in self.outputs.iter() {
                let mut output_stream = Xyiming::extract_stream_or_panic(&output_stream_id);
                if output_stream.status != StreamStatus::Active || !output_stream.auto_deposit_enabled {
                    Xyiming::streams().insert(&output_stream_id, &output_stream);
                    continue;
                }
                if tokens_left.get(&output_stream.token_id).is_none() {
                    output_stream.auto_deposit_enabled = false;
                    // TODO upd history here
                    Xyiming::streams().insert(&output_stream_id, &output_stream);
                    continue;
                }
                let deposit_needed = output_stream.get_amount_since_last_action(self.last_action);
                let current_tokens_left = *tokens_left.get(&output_stream.token_id).unwrap();
                if deposit_needed > current_tokens_left {
                    output_stream.auto_deposit_enabled = false;
                    // TODO upd history here
                    Xyiming::streams().insert(&output_stream_id, &output_stream);
                    continue;
                }
                // TODO upd history here
                output_stream.balance += deposit_needed;
                tokens_left.insert(output_stream.token_id, current_tokens_left - deposit_needed);
                Xyiming::streams().insert(&output_stream_id, &output_stream);
            }

            self.last_action = env::block_timestamp();
        }
        tokens_left.iter().map(|(&token_id, &amount)| Xyiming::build_promise(token_id, self.account_id.clone(), amount)).collect()
    }
}

impl Xyiming {
    pub(crate) fn extract_account_or_create(account_id: &AccountId) -> Account {
        Self::accounts().remove(&account_id).unwrap_or_else(|| {
            let mut prefix = Vec::with_capacity(33);
            prefix.push(b'x');
            prefix.extend(env::sha256(&account_id.as_bytes()));
            let mut prefix2 = Vec::with_capacity(33);
            prefix2.push(b'y');
            prefix2.extend(env::sha256(&account_id.as_bytes()));

            Account {
                account_id: account_id.into(),
                inputs: UnorderedSet::new(prefix),
                outputs: UnorderedSet::new(prefix2),
                last_action: env::block_timestamp(),
                // TODO set false by default
                cron_calls_enabled: true,
            }
        })
    }

    pub(crate) fn save_account_or_panic(account_id: &AccountId, account: &Account) {
        assert!(Self::accounts().insert(account_id, account).is_none());
    }
}
