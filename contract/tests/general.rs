use std::collections::HashMap;
use std::convert::TryInto;

/// Import the generated proxy contract
use xyiming::XyimingContract;
use xyiming::{
    AccountView, ActionView, StreamView, CREATE_STREAM_DEPOSIT, ERR_ACCESS_DENIED, ERR_CANNOT_START_STREAM,
    ERR_DEPOSIT_NOT_ENOUGH, ERR_PAUSE_PAUSED, ERR_STREAM_NOT_AVAILABLE, ONE_NEAR, ONE_YOCTO,
};

use near_sdk::json_types::{Base58CryptoHash, WrappedBalance};
use near_sdk_sim::{call, deploy, init_simulator, to_yocto, view, ContractAccount, UserAccount};

// Load in contract bytes at runtime
near_sdk_sim::lazy_static_include::lazy_static_include_bytes! {
  CONTRACT_WASM_BYTES => "res/xyiming.wasm",
}

const CONTRACT_ID: &str = "xyiming";

// const ERR_ASSERT: Option<&str> = Some("assertion failed");
// const ERR_UNWRAP: Option<&str> = Some("called `Option::unwrap()`");

const ALICE: &str = "alice";
const BOB: &str = "bob";
#[allow(dead_code)]
const CAROL: &str = "carol";
const DEFAULT_DESCRIPTION: &str = "default description";
const DEFAULT_TOKEN_NAME: &str = "NEAR";
const ONE_NEAR_PER_TICK: u128 = ONE_NEAR / 1_000_000_000;

struct State {
    pub root: UserAccount,
    pub contract: ContractAccount<XyimingContract>,
    pub accounts: HashMap<String, UserAccount>,
}

impl State {
    pub fn new() -> Self {
        let root = init_simulator(None);

        let deployed_contract = deploy!(
            contract: XyimingContract,
            contract_id: CONTRACT_ID,
            bytes: &CONTRACT_WASM_BYTES,
            signer_account: root,
            deposit: to_yocto("1000000000"),
            init_method: new()
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

    pub fn create_alice(&mut self) {
        let alice = self.root.create_user(ALICE.into(), to_yocto("1000000000"));
        self.accounts.insert(ALICE.into(), alice);
    }

    pub fn create_bob(&mut self) {
        let bob = self.root.create_user(BOB.into(), to_yocto("1000000000"));
        self.accounts.insert(BOB.into(), bob);
    }

    pub fn create_carol(&mut self) {
        let carol = self.root.create_user(CAROL.into(), to_yocto("1000000000"));
        self.accounts.insert(CAROL.into(), carol);
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
        let res = view!(contract.get_stream_history(stream_id.try_into().unwrap(), 0, 100)).unwrap_json();
        res
    }

    pub fn do_create_stream(
        &self,
        owner_id: &str,
        receiver_id: &str,
        tokens_per_tick: u128,
        err: Option<&str>,
    ) -> String {
        let contract = &self.contract;

        let outcome = call!(
            self.root,
            contract.create_stream(
                Some(DEFAULT_DESCRIPTION.to_string()),
                owner_id.try_into().unwrap(),
                receiver_id.try_into().unwrap(),
                DEFAULT_TOKEN_NAME.to_string(),
                tokens_per_tick.into(),
                false
            ),
            deposit = CREATE_STREAM_DEPOSIT + 123 * ONE_NEAR
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
            deposit = ONE_YOCTO
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
            contract.update_account(account_id.try_into().unwrap())
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

        let outcome = call!(caller, contract.pause_stream(stream_id.try_into().unwrap()));

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

        let outcome = call!(caller, contract.start_stream(stream_id.try_into().unwrap()));

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
    let state = State::new();

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);
    let stream = state.view_stream(&stream_id).unwrap();
    // TODO check all stream fields
    assert_eq!(stream.owner_id, ALICE);
}

#[test]
fn create_stream_check_users() {
    let state = State::new();

    let alice_account = state.view_account(ALICE);
    assert!(alice_account.is_none());
    let bob_account = state.view_account(BOB);
    assert!(bob_account.is_none());
    let carol_account = state.view_account(CAROL);
    assert!(carol_account.is_none());

    let _stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);

    // TODO check all user fields
    let alice_account = state.view_account(ALICE).unwrap();
    assert_eq!(alice_account.inputs.len(), 0);
    assert_eq!(alice_account.outputs.len(), 1);
    let bob_account = state.view_account(BOB).unwrap();
    assert_eq!(bob_account.inputs.len(), 1);
    assert_eq!(bob_account.outputs.len(), 0);
    let carol_account = state.view_account(CAROL);
    assert!(carol_account.is_none());
}

#[test]
fn create_stream_insufficient_funds() {
    let state = State::new();
    let contract = &state.contract;

    let outcome = call!(
        state.root,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            ALICE.try_into().unwrap(),
            BOB.try_into().unwrap(),
            DEFAULT_TOKEN_NAME.to_string(),
            ONE_NEAR_PER_TICK.into(),
            true
        ),
        deposit = CREATE_STREAM_DEPOSIT - 1
    );
    assert!(
        format!("{:?}", outcome.status()).contains(ERR_DEPOSIT_NOT_ENOUGH),
        "received {:?}",
        outcome.status()
    );
    assert!(!outcome.is_ok(), "Should panic");
}

#[test]
fn create_stream_stop_stream() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);
    state.do_stop(&state.root, &stream_id, Some(ERR_ACCESS_DENIED));

    state.do_stop(&alice, &stream_id, None);
    state.do_stop(&alice, &stream_id, Some(ERR_STREAM_NOT_AVAILABLE));
    state.do_stop(&bob, &stream_id, Some(ERR_STREAM_NOT_AVAILABLE));
    state.do_stop(&state.root, &stream_id, Some(ERR_ACCESS_DENIED));
}

#[test]
fn create_stream_instant_deposit() {
    let state = State::new();
    let contract = &state.contract;

    let outcome = call!(
        state.root,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            ALICE.try_into().unwrap(),
            BOB.try_into().unwrap(),
            DEFAULT_TOKEN_NAME.to_string(),
            ONE_NEAR_PER_TICK.into(),
            false
        ),
        deposit = CREATE_STREAM_DEPOSIT + 123 * ONE_NEAR
    );
    assert!(outcome.is_ok());

    let stream_id: String = (&outcome.unwrap_json::<Base58CryptoHash>()).into();
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR).into());
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
        state.root,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            ALICE.try_into().unwrap(),
            BOB.try_into().unwrap(),
            DEFAULT_TOKEN_NAME.to_string(),
            ONE_NEAR_PER_TICK.into(),
            false
        ),
        deposit = CREATE_STREAM_DEPOSIT
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

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR).into());

    state.do_update_account(ALICE, None);

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR).into());
    assert!(stream.status == "ACTIVE");

    state.do_update_account(BOB, None);

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(u128::from(stream.balance) < 123 * ONE_NEAR);
    assert!(u128::from(stream.balance) > 0);
    assert!(stream.status == "ACTIVE");

    assert!(
        bob.account().unwrap().amount + u128::from(stream.balance)
            == alice.account().unwrap().amount + 123 * ONE_NEAR
    );
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
        state.root,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            ALICE.try_into().unwrap(),
            BOB.try_into().unwrap(),
            DEFAULT_TOKEN_NAME.to_string(),
            ONE_NEAR_PER_TICK.into(),
            false
        ),
        deposit = CREATE_STREAM_DEPOSIT + 20 * ONE_NEAR
    );
    assert!(outcome.is_ok());

    let stream_id: String = (&outcome.unwrap_json::<Base58CryptoHash>()).into();

    assert!(bob.account().unwrap().amount == alice.account().unwrap().amount);

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

    assert!(bob.account().unwrap().amount == alice.account().unwrap().amount + 20 * ONE_NEAR);
}

#[test]
fn withdraw_then_stop() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);

    state.do_update_account(BOB, None);

    assert!(bob.account().unwrap().amount > alice.account().unwrap().amount);

    state.do_stop(alice, &stream_id, None);

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.balance == 0.into());
    assert!(stream.status == "INTERRUPTED");

    state.do_stop(alice, &stream_id, Some(ERR_STREAM_NOT_AVAILABLE));
    state.do_stop(bob, &stream_id, Some(ERR_STREAM_NOT_AVAILABLE));

    assert!(alice.account().unwrap().amount > bob.account().unwrap().amount + 100 * ONE_NEAR);
    assert!(bob.account().unwrap().amount > to_yocto("1000000000"));

    //println!("%%% {:?} {:?}", alice.account().unwrap().amount, bob.account().unwrap().amount);
}

#[test]
fn pause_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);

    state.do_start(alice, &stream_id, Some(ERR_CANNOT_START_STREAM));
    let prev_alice_balance = alice.account().unwrap().amount;
    let prev_bob_balance = bob.account().unwrap().amount;

    state.do_pause(alice, &stream_id, None);
    assert!(alice.account().unwrap().amount < prev_alice_balance);
    assert!(bob.account().unwrap().amount > prev_bob_balance);

    let stream = state.view_stream(&stream_id).unwrap();
    let stream_balance = u128::from(stream.balance);
    assert!(u128::from(stream.balance) < 123 * ONE_NEAR);
    assert!(u128::from(stream.balance) > 0);
    assert!(stream.status == "PAUSED");

    state.do_pause(alice, &stream_id, Some(ERR_PAUSE_PAUSED));
    state.do_pause(bob, &stream_id, Some(ERR_PAUSE_PAUSED));

    let prev_alice_balance = alice.account().unwrap().amount;
    let prev_bob_balance = bob.account().unwrap().amount;

    state.do_update_account(ALICE, None);
    state.do_update_account(BOB, None);

    assert!(alice.account().unwrap().amount == prev_alice_balance);
    assert!(bob.account().unwrap().amount == prev_bob_balance);

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

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);

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
            BOB.try_into().unwrap(),
            ALICE.try_into().unwrap(),
            DEFAULT_TOKEN_NAME.to_string(),
            (ONE_NEAR_PER_TICK / 2).into(),
            true
        ),
        deposit = CREATE_STREAM_DEPOSIT + 20 * ONE_NEAR
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
    let _alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let _stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);

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
            BOB.try_into().unwrap(),
            ALICE.try_into().unwrap(),
            DEFAULT_TOKEN_NAME.to_string(),
            (10 * ONE_NEAR_PER_TICK).into(),
            true
        ),
        deposit = CREATE_STREAM_DEPOSIT + 20 * ONE_NEAR
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
fn incoming_outgoing_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let _stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);

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
            BOB.try_into().unwrap(),
            ALICE.try_into().unwrap(),
            DEFAULT_TOKEN_NAME.to_string(),
            (ONE_NEAR_PER_TICK / 2).into(),
            true
        ),
        deposit = CREATE_STREAM_DEPOSIT + 10 * ONE_NEAR
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

    assert!(
        alice.account().unwrap().amount + bob.account().unwrap().amount
            < 2 * to_yocto("1000000000") + (123 + 20) * ONE_NEAR
    );
    assert!(
        alice.account().unwrap().amount + bob.account().unwrap().amount
            > 2 * to_yocto("1000000000")
    );

    //println!("@@@ {:?}", alice_account);

    //println!("%%% {:?} {:?}", alice.account().unwrap().amount, bob.account().unwrap().amount);
}

#[test]
fn stream_history_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();
    let contract = &state.contract;

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);
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
    assert!(stream.history_len == 4);
    let history = state.view_stream_history(&stream_id);
    assert!(history[3].action_type == "Withdraw");

    state.do_pause(alice, &stream_id, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 6);
    let history = state.view_stream_history(&stream_id);
    assert!(history[4].action_type == "Withdraw");
    assert!(history[5].action_type == "Pause");

    state.do_start(&alice, &stream_id, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 7);
    let history = state.view_stream_history(&stream_id);
    assert!(history[6].action_type == "Start");

    state.do_deposit(&stream_id, 123 * ONE_NEAR, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 8);
    let history = state.view_stream_history(&stream_id);
    assert!(history[7].action_type == "Deposit");

    let outcome = call!(
        bob,
        contract.create_stream(
            Some(DEFAULT_DESCRIPTION.to_string()),
            BOB.try_into().unwrap(),
            ALICE.try_into().unwrap(),
            DEFAULT_TOKEN_NAME.to_string(),
            (ONE_NEAR_PER_TICK / 2).into(),
            true
        ),
        deposit = CREATE_STREAM_DEPOSIT + ONE_NEAR
    );
    assert!(outcome.is_ok());
    let stream_id: String = (&outcome.unwrap_json::<Base58CryptoHash>()).into();

    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 4);
    let history = state.view_stream_history(&stream_id);
    assert!(history[0].action_type == "Init");
    assert!(history[1].action_type == "Auto-deposit enabled");
    assert!(history[2].action_type == "Deposit");
    assert!(history[3].action_type == "Start");

    state.do_update_account(BOB, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.auto_deposit_enabled);
    assert!(stream.history_len == 5);
    let history = state.view_stream_history(&stream_id);
    assert!(history[4].action_type == "Deposit");

    for _ in 0..10 {
        state.sdk_sim_tick_tock();
    }

    state.do_update_account(BOB, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.auto_deposit_enabled);
    assert!(stream.history_len == 6);
    let history = state.view_stream_history(&stream_id);
    assert!(history[5].action_type == "Deposit");

    for _ in 0..3 {
        state.sdk_sim_tick_tock();
    }

    state.do_update_account(ALICE, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(!stream.auto_deposit_enabled);
    assert!(stream.history_len == 9);
    let history = state.view_stream_history(&stream_id);
    assert!(history[6].action_type == "Withdraw");
    assert!(history[7].action_type == "Auto-deposit disabled");
    assert!(history[8].action_type == "Stop");

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);

    state.do_stop(&bob, &stream_id, None);
    let stream = state.view_stream(&stream_id).unwrap();
    assert!(stream.history_len == 6);
    let history = state.view_stream_history(&stream_id);
    assert!(history[0].action_type == "Init");
    assert!(history[1].action_type == "Deposit");
    assert!(history[2].action_type == "Start");
    assert!(history[3].action_type == "Withdraw");
    assert!(history[4].action_type == "Refund");
    assert!(history[5].action_type == "Stop");
}
