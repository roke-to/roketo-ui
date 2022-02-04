mod setup;

use crate::setup::*;
use contract::{StreamFinishReason, StreamId, StreamStatus, DEFAULT_STORAGE_BALANCE};
use near_sdk::env;

fn basic_setup() -> (Env, Tokens, Users) {
    let e = Env::init();
    let tokens = Tokens::init(&e);
    e.setup_assets(&tokens);

    let users = Users::init(&e);
    e.mint_tokens(&tokens, &users.alice);
    e.mint_tokens(&tokens, &users.bob);

    // e.show_balances(&users, &tokens);
    (e, tokens, users)
}

#[test]
fn test_init_env() {
    let e = Env::init();
    let _tokens = Tokens::init(&e);
    let _users = Users::init(&e);
}

#[test]
fn test_mint_tokens() {
    let e = Env::init();
    let tokens = Tokens::init(&e);
    let users = Users::init(&e);
    e.mint_tokens(&tokens, &users.alice);
}

#[test]
fn test_dev_setup() {
    let e = Env::init();
    let tokens = Tokens::init(&e);
    e.setup_assets(&tokens);

    let dao = e.get_dao();
    assert_eq!(dao.tokens.len(), 5);

    let stats = e.get_stats();
    assert_eq!(stats.listed_tokens.len(), 5);

    let (_, s) = e.get_token(&tokens.aurora);
    assert!(s.is_some());

    let (_, s) = e.get_token(&tokens.aurora);
    assert!(s.is_some());

    let (_, s) = e.get_token(&tokens.dacha);
    assert!(s.is_none());
}

#[test]
fn test_saved_storage_deposit() {
    let (mut e, tokens, users) = basic_setup();
    let period_sec = 100;
    let stream_id: StreamId = e
        .create_stream(
            &users.alice,
            &users.charlie,
            &tokens.wnear,
            d(1, 23) + 1,
            period_sec,
        )
        .into();
    assert_eq!(
        *e.streams.get(&stream_id).unwrap(),
        125 * env::STORAGE_PRICE_PER_BYTE
    );

    let stream_id: StreamId = e
        .create_stream(
            &users.alice,
            &users.charlie,
            &tokens.ndai,
            d(1, 18) + 1,
            period_sec,
        )
        .into();
    assert_eq!(
        *e.streams.get(&stream_id).unwrap(),
        125 * env::STORAGE_PRICE_PER_BYTE
    );

    let stream_id: StreamId = e
        .create_stream(
            &users.alice,
            &users.charlie,
            &tokens.nusdt,
            d(1, 6) + 1,
            period_sec,
        )
        .into();
    assert_eq!(
        *e.streams.get(&stream_id).unwrap(),
        125 * env::STORAGE_PRICE_PER_BYTE
    );

    let stream_id: StreamId = e
        .create_stream(
            &users.alice,
            &users.charlie,
            &tokens.aurora,
            d(1, 15) + 1,
            period_sec,
        )
        .into();
    assert_eq!(*e.streams.get(&stream_id).unwrap(), 0);

    e.account_deposit_near(&users.alice, d(1, 23));
    let stream_id: StreamId = e
        .create_stream(
            &users.alice,
            &users.charlie,
            &tokens.dacha,
            d(1, 10),
            period_sec,
        )
        .into();
    assert_eq!(*e.streams.get(&stream_id).unwrap(), DEFAULT_STORAGE_BALANCE);
}

// Actual tests start here

#[test]
fn test_stream_sanity() {
    let (mut e, tokens, users) = basic_setup();

    let amount = d(100, 24);
    let period_sec = 100;
    let stream_id = e.create_stream(
        &users.alice,
        &users.charlie,
        &tokens.wnear,
        amount,
        period_sec,
    );

    e.skip_time(period_sec);

    let dao = e.get_dao();
    let dao_token = dao.tokens.get(&tokens.wnear.account_id()).unwrap();
    let amount_after_create = amount - dao_token.commission_on_create;
    let stream = e.get_stream(&stream_id);

    assert_eq!(stream.balance, amount_after_create);
    assert_eq!(stream.owner_id, users.alice.account_id());
    assert_eq!(stream.receiver_id, users.charlie.account_id());
    assert_eq!(stream.tokens_per_sec * period_sec as u128, amount);
    assert_eq!(stream.tokens_total_withdrawn, 0);
    assert_eq!(stream.status, StreamStatus::Active);

    assert!(e.stop_stream(&users.alice, &stream_id).is_ok());

    let amount_after_stop = amount_after_create
        - amount_after_create * dao_token.commission_numerator as u128
            / dao_token.commission_denominator as u128;
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.balance, 0);
    assert_eq!(stream.owner_id, users.alice.account_id());
    assert_eq!(stream.receiver_id, users.charlie.account_id());
    assert_eq!(stream.tokens_per_sec * period_sec as u128, amount);
    assert_eq!(stream.tokens_total_withdrawn, amount_after_create);
    assert_eq!(
        stream.status,
        StreamStatus::Finished {
            reason: StreamFinishReason::FinishedNatually
        }
    );

    assert_eq!(
        u128::from(e.get_balance(&tokens.wnear, &users.charlie)),
        amount_after_stop
    );
}

/*use std::collections::HashMap;
use std::convert::TryInto;

/// Import the generated proxy contract
use roketo::RoketoContract;
use roketo::{
    AccountView, ActionView, CreateOrDeposit, CreateStruct, RoketoView, StreamView,
    ERR_ACCESS_DENIED, ERR_CANNOT_START_STREAM, ERR_PAUSE_PAUSED, ERR_STREAM_NOT_AVAILABLE,
    ONE_MILLI, ONE_NEAR, ONE_YOCTO,
};

use near_sdk::json_types::{Base58CryptoHash, WrappedBalance};
use near_sdk::serde_json;
use near_sdk_sim::transaction::ExecutionStatus;
use near_sdk_sim::{call, deploy, init_simulator, view, ContractAccount, UserAccount};

// Load in contract bytes at runtime
near_sdk_sim::lazy_static_include::lazy_static_include_bytes! {
  CONTRACT_WASM_BYTES => "res/roketo.wasm",
}

const CONTRACT_ID: &str = "roketo";

// const ERR_ASSERT: Option<&str> = Some("assertion failed");
// const ERR_UNWRAP: Option<&str> = Some("called `Option::unwrap()`");

const ALICE: &str = "alice";
const BOB: &str = "bob";
#[allow(dead_code)]
const CAROL: &str = "carol";
const DEFAULT_DESCRIPTION: &str = "default description";
const ONE_NEAR_PER_TICK: u128 = ONE_NEAR / 1_000_000_000;
const INIT_BALANCE: u128 = 1_000_000_000 * ONE_NEAR;

struct State {
    pub root: UserAccount,
    pub contract: ContractAccount<RoketoContract>,
    pub accounts: HashMap<String, UserAccount>,
}

impl State {
    pub fn new() -> Self {
        let root = init_simulator(None);

        let deployed_contract = deploy!(
            contract: RoketoContract,
            contract_id: CONTRACT_ID,
            bytes: &CONTRACT_WASM_BYTES,
            signer_account: root,
            deposit: INIT_BALANCE,
            init_method: test_new()
        );
        let state = State {
            root,
            contract: deployed_contract,
            accounts: HashMap::default(),
        };
        // Already added in new()
        // state.do_create_user(&state.root.account_id(), None);
        state
    }

    fn create_common_user(&mut self, name: &str) {
        let user = self.root.create_user(name.into(), INIT_BALANCE);
        let contract = &self.contract;
        let outcome = call!(
            user,
            contract.set_external_update_flag(true),
            deposit = ONE_YOCTO
        );
        outcome.assert_success();
        self.accounts.insert(name.into(), user);
    }

    pub fn create_alice(&mut self) {
        self.create_common_user(ALICE);
    }

    pub fn create_bob(&mut self) {
        self.create_common_user(BOB);
    }

    pub fn create_carol(&mut self) {
        self.create_common_user(CAROL);
    }

    pub fn view_account(&self, account_id: &str) -> Option<AccountView> {
        let contract = &self.contract;
        let res = view!(contract.get_account(account_id.try_into().unwrap())).unwrap_json();
        res
    }

    pub fn view_stream(&self, stream_id: &str) -> Option<StreamView> {
        let contract = &self.contract;
        let res = view!(contract.get_stream(stream_id.try_into().unwrap())).unwrap_json();
        res
    }

    pub fn view_stream_history(&self, stream_id: &str) -> Vec<ActionView> {
        let contract = &self.contract;
        let res =
            view!(contract.get_stream_history(stream_id.try_into().unwrap(), 0, 100)).unwrap_json();
        res
    }

    pub fn do_create_stream(
        &self,
        owner: &UserAccount,
        receiver_id: &str,
        tokens_per_tick: u128,
        err: Option<&str>,
    ) -> String {
        let contract = &self.contract;

        let outcome = call!(
            owner,
            contract.create_stream(
                Some(DEFAULT_DESCRIPTION.to_string()),
                receiver_id.try_into().unwrap(),
                tokens_per_tick.into(),
                true,
                false
            ),
            deposit = 123 * ONE_NEAR
        );

        if let Some(msg) = err {
            assert!(
                format!("{:?}", outcome.status()).contains(msg),
                "received {:?}",
                outcome.status()
            );
            assert!(!outcome.is_ok(), "Should panic");
            String::default()
        } else {
            outcome.assert_success();
            (&outcome.unwrap_json::<Base58CryptoHash>()).into()
        }
    }

    // WARN: outcome returns SuccessValue(``) for (Option<Promise>, Promise), so we cannot test it properly
    pub fn do_stop(&self, caller: &UserAccount, stream_id: &str, err: Option<&str>) {
        let contract = &self.contract;

        let outcome = call!(
            caller,
            contract.stop_stream(stream_id.try_into().unwrap()),
            deposit = ONE_MILLI
        );

        if let Some(msg) = err {
            assert!(
                format!("{:?}", outcome.status()).contains(msg),
                "received {:?}",
                outcome.status()
            );
            assert!(!outcome.is_ok(), "Should panic");
        } else {
            outcome.assert_success();
        }
    }

    pub fn do_deposit(&self, stream_id: &str, deposit: u128, err: Option<&str>) {
        let contract = &self.contract;

        let outcome = call!(
            self.root,
            contract.deposit(stream_id.try_into().unwrap()),
            deposit = deposit.into()
        );

        if let Some(msg) = err {
            assert!(
                format!("{:?}", outcome.status()).contains(msg),
                "received {:?}",
                outcome.status()
            );
            assert!(!outcome.is_ok(), "Should panic");
        } else {
            outcome.assert_success();
        }
    }

    pub fn do_update_account(&self, account_id: &str, err: Option<&str>) /*-> Promise*/
    {
        let contract = &self.contract;
        let outcome = call!(
            self.root,
            contract.update_account(account_id.try_into().unwrap()),
            deposit = ONE_MILLI
        );

        if let Some(msg) = err {
            assert!(
                format!("{:?}", outcome.status()).contains(msg),
                "received {:?}",
                outcome.status()
            );
            assert!(!outcome.is_ok(), "Should panic");
        } else {
            outcome.assert_success();
        }
    }

    pub fn do_pause(&self, caller: &UserAccount, stream_id: &str, err: Option<&str>) /*-> Promise*/
    {
        let contract = &self.contract;

        let outcome = call!(
            caller,
            contract.pause_stream(stream_id.try_into().unwrap()),
            deposit = ONE_MILLI
        );

        if let Some(msg) = err {
            assert!(
                format!("{:?}", outcome.status()).contains(msg),
                "received {:?}",
                outcome.status()
            );
            assert!(!outcome.is_ok(), "Should panic");
        } else {
            outcome.assert_success();
        }
    }

    pub fn do_start(&self, caller: &UserAccount, stream_id: &str, err: Option<&str>) /*-> Promise*/
    {
        let contract = &self.contract;

        let outcome = call!(
            caller,
            contract.start_stream(stream_id.try_into().unwrap()),
            deposit = ONE_MILLI
        );

        if let Some(msg) = err {
            assert!(
                format!("{:?}", outcome.status()).contains(msg),
                "received {:?}",
                outcome.status()
            );
            assert!(!outcome.is_ok(), "Should panic");
        } else {
            outcome.assert_success();
        }
    }

    pub fn do_change_autodeposit(
        &self,
        caller: &UserAccount,
        stream_id: &str,
        value: bool,
        err: Option<&str>,
    ) {
        let contract = &self.contract;

        let outcome = call!(
            caller,
            contract.change_auto_deposit(stream_id.try_into().unwrap(), value),
            deposit = ONE_MILLI
        );

        if let Some(msg) = err {
            assert!(
                format!("{:?}", outcome.status()).contains(msg),
                "received {:?}",
                outcome.status()
            );
            assert!(!outcome.is_ok(), "Should panic");
        } else {
            outcome.assert_success();
        }
    }

    pub fn sdk_sim_tick_tock(&self) {
        let contract = &self.contract;

        let outcome = call!(
            self.root,
            contract.stop_stream("11111111111111111111111111111111".try_into().unwrap()),
            deposit = ONE_YOCTO
        );
        assert!(!outcome.is_ok(), "Should panic");
    }

    pub fn validate(&self) {
        // TODO validate the graph
    }
}

#[test]
fn init_sanity() {
    let mut state = State::new();
    state.create_alice();

    state.validate();
}

#[test]
fn create_stream() {
    let mut state = State::new();
    state.create_alice();
    let alice = state.accounts.get(ALICE).unwrap();

    let stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);
    let stream = state.view_stream(&stream_id).unwrap();
    // TODO check all stream fields
    assert_eq!(stream.owner_id, ALICE);
}

#[test]
fn create_stream_check_users() {
    let mut state = State::new();
    state.create_alice();
    let alice = state.accounts.get(ALICE).unwrap();

    let carol_account = state.view_account(CAROL);
    assert!(carol_account.is_none());

    let _stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);

    // TODO check all user fields
    let alice_account = state.view_account(ALICE).unwrap();
    assert_eq!(alice_account.dynamic_inputs.len(), 0);
    assert_eq!(alice_account.dynamic_outputs.len(), 0);
    assert_eq!(alice_account.static_streams.len(), 1);
    let bob_account = state.view_account(BOB).unwrap();
    assert_eq!(bob_account.dynamic_inputs.len(), 1);
    assert_eq!(bob_account.dynamic_outputs.len(), 0);
    assert_eq!(bob_account.static_streams.len(), 0);
    let carol_account = state.view_account(CAROL);
    assert!(carol_account.is_none());

    state.create_carol();
    let carol_account = state.view_account(CAROL).unwrap();
    assert_eq!(carol_account.dynamic_inputs.len(), 0);
    assert_eq!(carol_account.dynamic_outputs.len(), 0);
    assert_eq!(carol_account.static_streams.len(), 0);
}

#[test]
fn create_stream_stop_stream() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);
    state.do_stop(&state.root, &stream_id, Some(ERR_ACCESS_DENIED));

    state.do_stop(&alice, &stream_id, None);
    state.do_stop(&alice, &stream_id, Some(ERR_STREAM_NOT_AVAILABLE));
    state.do_stop(&bob, &stream_id, Some(ERR_STREAM_NOT_AVAILABLE));
    state.do_stop(&state.root, &stream_id, Some(ERR_ACCESS_DENIED));
}

#[test]
fn create_stream_instant_deposit() {
    let mut state = State::new();
    state.create_alice();
    let alice = state.accounts.get(ALICE).unwrap();
    let contract = &state.contract;

    let outcome = call!(
        alice,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            BOB.try_into().unwrap(),
            ONE_NEAR_PER_TICK.into(),
            true,
            false
        ),
        deposit = 123 * ONE_NEAR
    );
    assert!(outcome.is_ok());

    let stream_id: String = (&outcome.unwrap_json::<Base58CryptoHash>()).into();
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR - 10 * ONE_MILLI).into());
    assert!(stream.status == "ACTIVE");
}

#[test]
fn create_stream_then_deposit_then_start() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let outcome = call!(
        alice,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            BOB.try_into().unwrap(),
            ONE_NEAR_PER_TICK.into(),
            false,
            false
        ),
        deposit = 10 * ONE_MILLI
    );
    assert!(outcome.is_ok());

    let stream_id: String = (&outcome.unwrap_json::<Base58CryptoHash>()).into();
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == 0.into());
    assert!(stream.status == "INITIALIZED");

    state.do_deposit(&stream_id, 123 * ONE_NEAR, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR).into());
    assert!(stream.status == "INITIALIZED");

    state.do_start(&bob, &stream_id, Some(ERR_ACCESS_DENIED));
    state.do_start(&alice, &stream_id, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR).into());
    assert!(stream.status == "ACTIVE");

    state.do_start(&alice, &stream_id, Some(ERR_CANNOT_START_STREAM));
}

#[test]
fn withdraw_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR - 10 * ONE_MILLI).into());

    state.do_update_account(ALICE, None);

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR - 10 * ONE_MILLI).into());
    assert!(stream.status == "ACTIVE");

    state.do_update_account(BOB, None);

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(u128::from(stream.balance) < 123 * ONE_NEAR - 10 * ONE_MILLI);
    assert!(u128::from(stream.balance) > 0);
    assert!(stream.status == "ACTIVE");

    assert!(
        bob.account().unwrap().amount + u128::from(stream.balance) < INIT_BALANCE + 123 * ONE_NEAR
    );
    assert!(
        bob.account().unwrap().amount + u128::from(stream.balance) > INIT_BALANCE + 122 * ONE_NEAR
    );
    assert!(bob.account().unwrap().amount < INIT_BALANCE + 123 * ONE_NEAR);
    assert!(bob.account().unwrap().amount > INIT_BALANCE);
}

#[test]
fn withdraw_all() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let outcome = call!(
        alice,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            BOB.try_into().unwrap(),
            ONE_NEAR_PER_TICK.into(),
            true,
            false
        ),
        deposit = 20 * ONE_NEAR + 10 * ONE_MILLI
    );
    assert!(outcome.is_ok());

    let stream_id: String = (&outcome.unwrap_json::<Base58CryptoHash>()).into();

    state.do_update_account(BOB, None);

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(u128::from(stream.balance) < 123 * ONE_NEAR);
    assert!(u128::from(stream.balance) > 0);
    assert!(stream.status == "ACTIVE");

    for _ in 0..25 {
        state.sdk_sim_tick_tock();
    }

    state.do_update_account(BOB, None);

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == 0.into());
    assert!(stream.tokens_total_withdrawn == (20 * ONE_NEAR).into());
    assert!(stream.status == "FINISHED");

    assert!(bob.account().unwrap().amount < INIT_BALANCE + 20 * ONE_NEAR);
    assert!(bob.account().unwrap().amount > INIT_BALANCE + 19 * ONE_NEAR);
}

#[test]
fn withdraw_then_stop() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);

    state.do_update_account(BOB, None);

    assert!(bob.account().unwrap().amount > alice.account().unwrap().amount);

    state.do_stop(alice, &stream_id, None);

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == 0.into());
    assert!(stream.status == "INTERRUPTED");

    state.do_stop(alice, &stream_id, Some(ERR_STREAM_NOT_AVAILABLE));
    state.do_stop(bob, &stream_id, Some(ERR_STREAM_NOT_AVAILABLE));

    state.do_update_account(ALICE, None);

    assert!(alice.account().unwrap().amount + 100 * ONE_NEAR > INIT_BALANCE);
    assert!(bob.account().unwrap().amount > INIT_BALANCE);
}

#[test]
fn pause_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);

    state.do_start(alice, &stream_id, Some(ERR_CANNOT_START_STREAM));
    let prev_alice_balance = alice.account().unwrap().amount;
    let prev_bob_balance = bob.account().unwrap().amount;

    state.do_pause(alice, &stream_id, None);
    assert!(alice.account().unwrap().amount < prev_alice_balance);
    assert!(alice.account().unwrap().amount + ONE_NEAR > prev_alice_balance);
    assert!(bob.account().unwrap().amount == prev_bob_balance);

    let stream = state.view_stream(&stream_id).unwrap();
    let stream_balance = u128::from(stream.balance);
    assert!(u128::from(stream.balance) < 123 * ONE_NEAR);
    assert!(u128::from(stream.balance) > 0);
    assert!(stream.status == "PAUSED");

    let prev_alice_balance = alice.account().unwrap().amount;
    state.do_update_account(ALICE, None);
    state.do_update_account(BOB, None);
    assert!(alice.account().unwrap().amount == prev_alice_balance);
    assert!(bob.account().unwrap().amount > prev_bob_balance);

    let prev_bob_balance = bob.account().unwrap().amount;
    state.do_update_account(BOB, None);
    assert!(bob.account().unwrap().amount == prev_bob_balance);

    state.do_pause(alice, &stream_id, Some(ERR_PAUSE_PAUSED));
    state.do_pause(bob, &stream_id, Some(ERR_PAUSE_PAUSED));

    state.do_start(bob, &stream_id, Some(ERR_ACCESS_DENIED));
    let prev_bob_balance = bob.account().unwrap().amount;
    state.do_start(alice, &stream_id, None);

    assert!(alice.account().unwrap().amount < prev_alice_balance);
    let prev_alice_balance = alice.account().unwrap().amount;
    assert!(bob.account().unwrap().amount == prev_bob_balance);

    state.do_update_account(ALICE, None);
    state.do_update_account(BOB, None);

    assert!(alice.account().unwrap().amount == prev_alice_balance);
    assert!(bob.account().unwrap().amount > prev_bob_balance);

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(u128::from(stream.balance) < stream_balance);
    assert!(u128::from(stream.balance) > 0);
    assert!(stream.status == "ACTIVE");
}

#[test]
fn account_view_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);

    let alice_account = state.view_account(ALICE).unwrap();
    let bob_account = state.view_account(BOB).unwrap();
    assert!(alice_account.total_outgoing == []);
    assert!(alice_account.total_incoming == []);
    assert!(bob_account.total_outgoing == []);
    assert!(
        bob_account.total_incoming
            == [("NEAR".to_string(), WrappedBalance::from(ONE_NEAR_PER_TICK))]
    );

    let outcome = call!(
        bob,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            ALICE.try_into().unwrap(),
            (ONE_NEAR_PER_TICK / 2).into(),
            true,
            true
        ),
        deposit = 20 * ONE_NEAR
    );
    assert!(outcome.is_ok());

    let alice_account = state.view_account(ALICE).unwrap();
    let bob_account = state.view_account(BOB).unwrap();
    assert!(alice_account.total_outgoing == []);
    assert!(
        alice_account.total_incoming
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_outgoing
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_incoming
            == [("NEAR".to_string(), WrappedBalance::from(ONE_NEAR_PER_TICK))]
    );

    state.do_pause(alice, &stream_id, None);

    let alice_account = state.view_account(ALICE).unwrap();
    let bob_account = state.view_account(BOB).unwrap();
    assert!(alice_account.total_outgoing == []);
    assert!(
        alice_account.total_incoming
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_outgoing
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(bob_account.total_incoming == []);
}

#[test]
fn withdraw_overflow() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let _stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);

    let alice_account = state.view_account(ALICE).unwrap();
    let bob_account = state.view_account(BOB).unwrap();

    assert!(alice_account.total_outgoing == []);
    assert!(alice_account.total_incoming == []);
    assert!(bob_account.total_outgoing == []);
    assert!(
        bob_account.total_incoming
            == [("NEAR".to_string(), WrappedBalance::from(ONE_NEAR_PER_TICK))]
    );

    let outcome = call!(
        bob,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            ALICE.try_into().unwrap(),
            (10 * ONE_NEAR_PER_TICK).into(),
            true,
            true
        ),
        deposit = 20 * ONE_NEAR
    );
    assert!(outcome.is_ok());

    let alice_account = state.view_account(ALICE).unwrap();
    let bob_account = state.view_account(BOB).unwrap();
    assert!(alice_account.total_outgoing == []);
    assert!(
        alice_account.total_incoming
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(10 * ONE_NEAR_PER_TICK)
            )]
    );
    assert!(
        bob_account.total_outgoing
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(10 * ONE_NEAR_PER_TICK)
            )]
    );
    assert!(
        bob_account.total_incoming
            == [("NEAR".to_string(), WrappedBalance::from(ONE_NEAR_PER_TICK))]
    );

    // must be disabled instantly
    state.do_update_account(BOB, None);

    let alice_account = state.view_account(ALICE).unwrap();
    let bob_account = state.view_account(BOB).unwrap();
    assert!(alice_account.total_outgoing == []);
    assert!(
        alice_account.total_incoming
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(10 * ONE_NEAR_PER_TICK)
            )]
    );
    assert!(bob_account.total_outgoing == []);
    assert!(
        bob_account.total_incoming
            == [("NEAR".to_string(), WrappedBalance::from(ONE_NEAR_PER_TICK))]
    );
}

#[test]
fn autodeposit_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let _stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);

    let alice_account = state.view_account(ALICE).unwrap();
    let bob_account = state.view_account(BOB).unwrap();
    assert!(alice_account.total_outgoing == []);
    assert!(alice_account.total_incoming == []);
    assert!(bob_account.total_outgoing == []);
    assert!(
        bob_account.total_incoming
            == [("NEAR".to_string(), WrappedBalance::from(ONE_NEAR_PER_TICK))]
    );

    let outcome = call!(
        bob,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            ALICE.try_into().unwrap(),
            (ONE_NEAR_PER_TICK / 2).into(),
            true,
            true
        ),
        deposit = 10 * ONE_NEAR
    );
    assert!(outcome.is_ok());

    let alice_account = state.view_account(ALICE).unwrap();
    let bob_account = state.view_account(BOB).unwrap();
    assert!(alice_account.total_outgoing == []);
    assert!(
        alice_account.total_incoming
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_outgoing
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_incoming
            == [("NEAR".to_string(), WrappedBalance::from(ONE_NEAR_PER_TICK))]
    );

    state.do_update_account(BOB, None);

    let alice_account = state.view_account(ALICE).unwrap();
    let bob_account = state.view_account(BOB).unwrap();
    assert!(alice_account.total_outgoing == []);
    assert!(
        alice_account.total_incoming
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_outgoing
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_incoming
            == [("NEAR".to_string(), WrappedBalance::from(ONE_NEAR_PER_TICK))]
    );

    for _ in 0..25 {
        // more steps than initial balance can handle
        state.do_update_account(BOB, None);
    }

    let alice_account = state.view_account(ALICE).unwrap();
    let bob_account = state.view_account(BOB).unwrap();
    assert!(alice_account.total_outgoing == []);
    assert!(
        alice_account.total_incoming
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_outgoing
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_incoming
            == [("NEAR".to_string(), WrappedBalance::from(ONE_NEAR_PER_TICK))]
    );

    state.do_update_account(ALICE, None);

    let alice_account = state.view_account(ALICE).unwrap();
    assert!(alice_account.total_outgoing == []);
    assert!(
        alice_account.total_incoming
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_outgoing
            == [(
                "NEAR".to_string(),
                WrappedBalance::from(ONE_NEAR_PER_TICK / 2)
            )]
    );
    assert!(
        bob_account.total_incoming
            == [("NEAR".to_string(), WrappedBalance::from(ONE_NEAR_PER_TICK))]
    );
}

#[test]
fn stream_history_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 3);
    let history = state.view_stream_history(&stream_id);
    assert!(history[0].action_type == "Init");
    assert!(history[1].action_type == "Deposit");
    assert!(history[2].action_type == "Start");

    state.do_update_account(ALICE, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 3);

    state.do_update_account(BOB, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 5);
    let history = state.view_stream_history(&stream_id);
    assert!(history[3].action_type == "Update");
    assert!(history[4].action_type == "Withdraw");

    state.do_pause(alice, &stream_id, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 8);
    let history = state.view_stream_history(&stream_id);
    assert!(history[5].action_type == "Update");
    assert!(history[6].action_type == "Withdraw");
    assert!(history[7].action_type == "Pause");

    state.do_start(&alice, &stream_id, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 9);
    let history = state.view_stream_history(&stream_id);
    assert!(history[8].action_type == "Start");

    state.do_deposit(&stream_id, 123 * ONE_NEAR, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 10);
    let history = state.view_stream_history(&stream_id);
    assert!(history[9].action_type == "Deposit");

    let outcome = call!(
        bob,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            ALICE.try_into().unwrap(),
            (ONE_NEAR_PER_TICK / 2).into(),
            true,
            true
        ),
        deposit = ONE_NEAR
    );
    assert!(outcome.is_ok());
    let stream_id: String = (&outcome.unwrap_json::<Base58CryptoHash>()).into();

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 4);
    let history = state.view_stream_history(&stream_id);
    assert!(history[0].action_type == "Init");
    assert!(history[1].action_type == "Deposit");
    assert!(history[2].action_type == "Start");
    assert!(history[3].action_type == "Auto-deposit enabled");

    state.do_update_account(BOB, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.is_auto_deposit_enabled);
    assert!(stream.history_len == 6);
    let history = state.view_stream_history(&stream_id);
    assert!(history[4].action_type == "Update");
    assert!(history[5].action_type == "Deposit");

    for _ in 0..10 {
        state.sdk_sim_tick_tock();
    }

    state.do_update_account(BOB, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.is_auto_deposit_enabled);
    assert!(stream.history_len == 8);
    let history = state.view_stream_history(&stream_id);
    assert!(history[6].action_type == "Update");
    assert!(history[7].action_type == "Deposit");

    for _ in 0..3 {
        state.sdk_sim_tick_tock();
    }

    state.do_update_account(ALICE, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(!stream.is_auto_deposit_enabled);
    assert!(stream.history_len == 12);
    let history = state.view_stream_history(&stream_id);
    assert!(history[8].action_type == "Update");
    assert!(history[9].action_type == "Withdraw");
    assert!(history[10].action_type == "Auto-deposit disabled");
    assert!(history[11].action_type == "Stop");

    let stream_id = state.do_create_stream(alice, BOB, ONE_NEAR_PER_TICK, None);

    state.do_stop(&bob, &stream_id, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 7);
    let history = state.view_stream_history(&stream_id);
    assert!(history[0].action_type == "Init");
    assert!(history[1].action_type == "Deposit");
    assert!(history[2].action_type == "Start");
    assert!(history[3].action_type == "Update");
    assert!(history[4].action_type == "Withdraw");
    assert!(history[5].action_type == "Refund");
    assert!(history[6].action_type == "Stop");
}

#[test]
fn ft_transfer_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let outcome = call!(
        alice,
        contract.ft_on_transfer(
            ALICE.try_into().unwrap(),
            (123 * ONE_NEAR).into(),
            "shit".to_string()
        ),
        deposit = 0
    );
    assert!(outcome.is_ok());

    let outcome = call!(
        alice,
        contract.ft_on_transfer(
            ALICE.try_into().unwrap(),
            (123 * ONE_NEAR).into(),
            "shit".to_string()
        ),
        deposit = 0
    );
    assert!(outcome.is_ok());
    assert!(
        outcome.status()
            == ExecutionStatus::SuccessValue(
                "\"123000000000000000000000000\""
                    .to_string()
                    .as_bytes()
                    .to_vec()
            )
    );

    // TODO enable
    /*let cod: CreateOrDeposit = CreateOrDeposit::Deposit(
        "425LBB7A4QvmhpdxcU1aWAHUuCRz5ShJbtFLKSWhsuaF"
            .try_into()
            .unwrap(),
    );
    let json: String = serde_json::to_string(&cod).unwrap();

    println!("??? {:?}", json);

    let outcome = call!(
        alice,
        contract.ft_on_transfer(ALICE.try_into().unwrap(), (123 * ONE_NEAR).into(), json),
        deposit = 0
    );
    assert!(!outcome.is_ok());
    println!("??? {:?}", outcome);*/

    let cod: CreateOrDeposit = CreateOrDeposit::Create(CreateStruct {
        description: Some("example".to_string()),
        receiver_id: BOB.try_into().unwrap(),
        token_name: "ALICETOKEN".to_string(),
        balance: (123 * ONE_NEAR).into(),
        tokens_per_tick: ONE_NEAR_PER_TICK.into(),
        is_auto_start_enabled: true,
        is_auto_deposit_enabled: false,
    });
    let json: String = serde_json::to_string(&cod).unwrap();

    let outcome = call!(
        bob,
        contract.ft_on_transfer(
            ALICE.try_into().unwrap(),
            (123 * ONE_NEAR).into(),
            json.clone()
        ),
        deposit = 0
    );
    assert!(outcome.is_ok());
    // Invalid sender bob
    assert!(
        outcome.status()
            == ExecutionStatus::SuccessValue(
                "\"123000000000000000000000000\""
                    .to_string()
                    .as_bytes()
                    .to_vec()
            )
    );

    let outcome = call!(
        alice,
        contract.ft_on_transfer(ALICE.try_into().unwrap(), (123 * ONE_NEAR).into(), json),
        deposit = 0
    );
    assert!(outcome.is_ok());
    assert!(
        outcome.status() == ExecutionStatus::SuccessValue("\"0\"".to_string().as_bytes().to_vec())
    );

    let alice_account = state.view_account(ALICE).unwrap();
    assert_eq!(alice_account.dynamic_inputs.len(), 0);
    assert_eq!(alice_account.dynamic_outputs.len(), 0);
    assert_eq!(alice_account.static_streams.len(), 1);
    let bob_account = state.view_account(BOB).unwrap();
    assert_eq!(bob_account.dynamic_inputs.len(), 1);
    assert_eq!(bob_account.dynamic_outputs.len(), 0);
    assert_eq!(bob_account.static_streams.len(), 0);

    let stream_hash: Base58CryptoHash = bob_account.dynamic_inputs[0].into();
    let stream_id: String = (&stream_hash).into();

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.owner_id == ALICE);
    assert!(stream.receiver_id == BOB);
    assert!(stream.ticker == "ALICETOKEN");
    assert!(stream.balance == (123 * ONE_NEAR).into());
    assert!(stream.tokens_per_tick == ONE_NEAR_PER_TICK.into());
    assert!(stream.is_auto_deposit_enabled == false);
    assert!(stream.status == "ACTIVE");
    assert!(stream.history_len == 3);

    let cod: CreateOrDeposit = CreateOrDeposit::Deposit(stream_hash);
    let json: String = serde_json::to_string(&cod).unwrap();
    println!("### {:?}", json);

    let outcome = call!(
        alice,
        contract.ft_on_transfer(ALICE.try_into().unwrap(), (20 * ONE_NEAR).into(), json),
        deposit = 0
    );
    assert!(outcome.is_ok());
    assert!(
        outcome.status() == ExecutionStatus::SuccessValue("\"0\"".to_string().as_bytes().to_vec())
    );

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.owner_id == ALICE);
    assert!(stream.receiver_id == BOB);
    assert!(stream.ticker == "ALICETOKEN");
    assert!(stream.balance == (143 * ONE_NEAR).into());
    assert!(stream.tokens_per_tick == ONE_NEAR_PER_TICK.into());
    assert!(stream.is_auto_deposit_enabled == false);
    assert!(stream.status == "ACTIVE");
    assert!(stream.history_len == 4);
}

#[test]
fn dao_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let contract = &state.contract;
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let res: RoketoView = view!(contract.get_status()).unwrap_json();
    assert!(res.tokens[0].commission_percentage == 0.1);

    let outcome = call!(
        bob,
        contract.dao_set_token_commission(0, ONE_NEAR.into(), 7.into(), 123.into()),
        deposit = ONE_YOCTO
    );
    assert!(!outcome.is_ok());

    let outcome = call!(
        alice,
        contract.dao_set_token_commission(0, ONE_NEAR.into(), 7.into(), 123.into()),
        deposit = ONE_YOCTO
    );
    assert!(outcome.is_ok());

    let res: RoketoView = view!(contract.get_status()).unwrap_json();
    assert!(res.tokens[0].commission_on_create == ONE_NEAR.into());
    assert!(res.tokens[0].commission_percentage == 700 as f32 / 123 as f32);

    assert!(res.num_tokens_listed == 4);

    let outcome = call!(
        alice,
        contract.dao_token_listing(
            "a".into(),
            "b".into(),
            "keton.near".try_into().unwrap(),
            926.into(),
            3.into(),
            270.into()
        ),
        deposit = ONE_YOCTO
    );
    assert!(outcome.is_ok());

    let res: RoketoView = view!(contract.get_status()).unwrap_json();
    assert!(res.num_tokens_listed == 5);
    assert!(res.tokens[4].name == "a");
    assert!(res.tokens[4].ticker == "b");
    assert!(res.tokens[4].account_id == "keton.near");
    assert!(res.tokens[4].commission_on_create == 926.into());
    assert!(res.tokens[4].commission_percentage == 10 as f32 / 9 as f32);
    assert!(res.tokens[4].total_commission == 0.into());
    assert!(res.tokens[4].is_active);

    let outcome = call!(
        alice,
        contract.dao_set_token_active_flag(4, false),
        deposit = ONE_YOCTO
    );
    assert!(outcome.is_ok());

    let res: RoketoView = view!(contract.get_status()).unwrap_json();
    assert!(res.num_tokens_listed == 5);
    assert!(res.tokens[4].name == "a");
    assert!(res.tokens[4].ticker == "b");
    assert!(res.tokens[4].account_id == "keton.near");
    assert!(!res.tokens[4].is_active);

    assert!(res.operational_commission == ONE_MILLI.into());

    let outcome = call!(
        alice,
        contract.dao_set_operational_commission((2 * ONE_MILLI).into()),
        deposit = ONE_YOCTO
    );
    assert!(outcome.is_ok());
    let res: RoketoView = view!(contract.get_status()).unwrap_json();
    assert!(res.operational_commission == (2 * ONE_MILLI).into());
}

#[test]
fn vietnam_withdraw() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let outcome = call!(
        alice,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            BOB.try_into().unwrap(),
            ONE_NEAR_PER_TICK.into(),
            true,
            true
        ),
        deposit = 20 * ONE_NEAR + 10 * ONE_MILLI
    );
    assert!(outcome.is_ok());

    let stream_id: String = (&outcome.unwrap_json::<Base58CryptoHash>()).into();

    let bob_account = state.view_account(BOB).unwrap();
    println!("BBB {:?}", bob_account);

    for _ in 0..3 {
        state.sdk_sim_tick_tock();
    }

    //state.do_update_account(ALICE, None);
    let outcome = call!(
        alice,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            BOB.try_into().unwrap(),
            (1 * ONE_NEAR_PER_TICK).into(),
            true,
            true
        ),
        deposit = 20 * ONE_NEAR + 10 * ONE_MILLI
    );
    assert!(outcome.is_ok());

    let stream_id_2: String = (&outcome.unwrap_json::<Base58CryptoHash>()).into();

    let stream = state.view_stream(&stream_id).unwrap();
    println!("###1 {:?}", stream);
    let bob_account = state.view_account(BOB).unwrap();
    println!("BBB {:?}", bob_account);

    for _ in 0..25 {
        state.sdk_sim_tick_tock();
    }

    state.do_change_autodeposit(alice, &stream_id, true, None);

    //state.do_update_account(BOB, None);

    let stream = state.view_stream(&stream_id).unwrap();
    println!("###1 {:?}", stream);
    let stream2 = state.view_stream(&stream_id_2).unwrap();
    println!("###2 {:?}", stream2);
    let bob_account = state.view_account(BOB).unwrap();
    println!("BBB {:?}", bob_account);
    println!("BBB BALANCE {:?}", bob.account().unwrap().amount);
    /*assert!(stream.balance == 0.into());
    assert!(stream.tokens_total_withdrawn == (20 * ONE_NEAR).into());
    assert!(stream.status == "FINISHED");

    assert!(bob.account().unwrap().amount < INIT_BALANCE + 20 * ONE_NEAR);
    assert!(bob.account().unwrap().amount > INIT_BALANCE + 19 * ONE_NEAR);*/
}
*/
