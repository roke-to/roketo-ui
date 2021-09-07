use std::collections::HashMap;

use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Account {
    pub account_id: AccountId,
    /// Graph of actual streams to enable quick search by AccountId
    pub inputs: UnorderedSet<StreamId>,
    pub outputs: UnorderedSet<StreamId>,

    pub last_action: Timestamp,

    pub total_incoming: Vec<Balance>,
    pub total_outgoing: Vec<Balance>,
    pub total_received: Vec<Balance>,

    pub cron_calls_enabled: bool,
    // TODO add stats
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct AccountView {
    pub account_id: String,
    pub inputs: Vec<StreamId>,
    pub outputs: Vec<StreamId>,
    pub last_action: WrappedTimestamp,
    pub total_received: Vec<(String, WrappedBalance)>,
    pub total_incoming: Vec<(String, WrappedBalance)>,
    pub total_outgoing: Vec<(String, WrappedBalance)>,
    pub cron_calls_enabled: bool,
}

impl From<&Account> for AccountView {
    fn from(a: &Account) -> Self {
        Self {
            account_id: a.account_id.clone(),
            inputs: a.inputs.to_vec(),
            outputs: a.outputs.to_vec(),
            last_action: a.last_action.into(),
            total_received: a
                .total_received
                .iter()
                .enumerate()
                .filter(|(_, &amount)| amount != 0)
                .map(|(token_id, &amount)| (Xyiming::get_token_name_by_id(token_id as u32), amount.into()))
                .collect(),
            cron_calls_enabled: a.cron_calls_enabled,
            total_incoming: a.total_incoming
                .iter()
                .enumerate()
                .filter(|(_, &amount)| amount != 0)
                .map(|(token_id, &amount)| {
                    (Xyiming::get_token_name_by_id(token_id as u32), amount.into())
                })
                .collect(),
            total_outgoing: a.total_outgoing
                .iter()
                .enumerate()
                .filter(|(_, &amount)| amount != 0)
                .map(|(token_id, &amount)| {
                    (Xyiming::get_token_name_by_id(token_id as u32), amount.into())
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

    pub(crate) fn update_state(&mut self) -> Vec<Promise> {
        let mut tokens_left = HashMap::<TokenId, Balance>::new();
        if self.last_action != env::block_timestamp() {
            self.total_incoming = vec![0; NUM_TOKENS];
            self.total_outgoing = vec![0; NUM_TOKENS];
            for input_stream_id in self.inputs.iter() {
                let mut input_stream = Xyiming::extract_stream_or_panic(&input_stream_id);
                if input_stream.status != StreamStatus::Active {
                    Xyiming::streams().insert(&input_stream_id, &input_stream);
                    continue;
                }
                let payment = input_stream.process_withdraw(self.last_action);
                if input_stream.status == StreamStatus::Active {
                    self.total_incoming[input_stream.token_id as usize] += input_stream.tokens_per_tick;
                }
                Xyiming::streams().insert(&input_stream_id, &input_stream);
                tokens_left.insert(input_stream.token_id, payment);
            }

            for output_stream_id in self.outputs.iter() {
                let mut output_stream = Xyiming::extract_stream_or_panic(&output_stream_id);
                if output_stream.status != StreamStatus::Active
                    || !output_stream.auto_deposit_enabled
                {
                    Xyiming::streams().insert(&output_stream_id, &output_stream);
                    continue;
                }
                if tokens_left.get(&output_stream.token_id).is_none() {
                    output_stream.auto_deposit_enabled = false;
                    output_stream.add_action(ActionType::DisableAutoDeposit);
                    Xyiming::streams().insert(&output_stream_id, &output_stream);
                    continue;
                }
                let deposit_needed = output_stream.get_amount_since_last_action(self.last_action);
                let current_tokens_left = *tokens_left.get(&output_stream.token_id).unwrap();
                if deposit_needed > current_tokens_left {
                    output_stream.auto_deposit_enabled = false;
                    output_stream.add_action(ActionType::DisableAutoDeposit);
                    Xyiming::streams().insert(&output_stream_id, &output_stream);
                    continue;
                }
                output_stream.balance += deposit_needed;
                output_stream.add_action(ActionType::Deposit(deposit_needed));
                self.total_outgoing[output_stream.token_id as usize] += output_stream.tokens_per_tick;
                tokens_left.insert(output_stream.token_id, current_tokens_left - deposit_needed);
                Xyiming::streams().insert(&output_stream_id, &output_stream);
            }

            self.last_action = env::block_timestamp();

            for (token_id, amount) in tokens_left.iter() {
                self.total_received[*token_id as usize] += *amount;
            }

            tokens_left
                .iter()
                .map(|(&token_id, &amount)| {
                    Xyiming::build_promise(token_id, self.account_id.clone(), amount)
                })
                .collect()
        } else {
            vec![]
        }
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
                total_incoming: vec![0; NUM_TOKENS],
                total_outgoing: vec![0; NUM_TOKENS],
                total_received: vec![0; NUM_TOKENS],
                // TODO set false by default
                cron_calls_enabled: true,
            }
        })
    }

    pub(crate) fn save_account_or_panic(account_id: &AccountId, account: &Account) {
        assert!(Self::accounts().insert(account_id, account).is_none());
    }
}
