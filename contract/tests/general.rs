use std::collections::HashMap;
use std::convert::TryInto;

/// Import the generated proxy contract
use xyiming::XyimingContract;
use xyiming::{
    StreamView, AccountView, ONE_YOCTO, ONE_NEAR, ERR_DEPOSIT_NOT_ENOUGH, ERR_ACCESS_DENIED, ERR_STREAM_NOT_ACTIVE,
    CREATE_STREAM_DEPOSIT
};

use near_sdk::json_types::Base58CryptoHash;
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

    pub fn get_account(&self, account_id: &str) -> Option<AccountView> {
        let contract = &self.contract;
        let res = view!(contract.get_account(account_id.try_into().unwrap())).unwrap_json();
        res
    }

    pub fn get_stream(&self, stream_id: &str) -> Option<StreamView> {
        let contract = &self.contract;
        let res = view!(contract.get_stream(stream_id.try_into().unwrap())).unwrap_json();
        res
    }

    pub fn do_create_stream(&self, owner_id: &str, receiver_id: &str, tokens_per_tick: u128, err: Option<&str>) -> String {
        let contract = &self.contract;

        let outcome = call!(
            self.root,
            contract.create_stream(
                owner_id.try_into().unwrap(),
                receiver_id.try_into().unwrap(),
                DEFAULT_TOKEN_NAME.to_string(),
                tokens_per_tick.into()
            ),
            deposit = CREATE_STREAM_DEPOSIT
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

        (&outcome.unwrap_json::<Base58CryptoHash>()).into()
    }

    // WARN: outcome returns SuccessValue(``) for (Option<Promise>, Promise), so we cannot test it properly
    pub fn do_stop_stream(&self, caller: &UserAccount, stream_id: &str, err: Option<&str>) /*-> (Option<Promise>, Promise)*/ {
        let contract = &self.contract;

        let outcome = call!(
            caller,
            contract.stop_stream(
                stream_id.try_into().unwrap()
            ),
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
            contract.deposit(
                stream_id.try_into().unwrap()
            ),
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

    pub fn do_withdraw(&self, caller: &UserAccount, stream_id: &str, err: Option<&str>) /*-> Promise*/ {
        let contract = &self.contract;

        let outcome = call!(
            caller,
            contract.withdraw(
                stream_id.try_into().unwrap()
            )
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
            contract.stop_stream(
                "11111111111111111111111111111111".try_into().unwrap()
            ),
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

    let stream_id = state.do_create_stream(ALICE, BOB, 100, None);
    let stream = state.get_stream(&stream_id).unwrap();
    // TODO check all stream fields
    assert_eq!(
        stream.owner_id, ALICE
    );
}

#[test]
fn create_stream_check_users() {
    let state = State::new();

    let alice_account = state.get_account(ALICE);
    assert!(alice_account.is_none());
    let bob_account = state.get_account(BOB);
    assert!(bob_account.is_none());
    let carol_account = state.get_account(CAROL);
    assert!(carol_account.is_none());

    let _stream_id = state.do_create_stream(ALICE, BOB, 100, None);

    // TODO check all user fields
    let alice_account = state.get_account(ALICE).unwrap();
    assert_eq!(alice_account.inputs.len(), 0);
    assert_eq!(alice_account.outputs.len(), 1);
    let bob_account = state.get_account(BOB).unwrap();
    assert_eq!(bob_account.inputs.len(), 1);
    assert_eq!(bob_account.outputs.len(), 0);
    let carol_account = state.get_account(CAROL);
    assert!(carol_account.is_none());
}

#[test]
fn create_stream_insufficient_funds() {
    let state = State::new();
    let contract = &state.contract;

    let outcome = call!(
        state.root,
        contract.create_stream(
            ALICE.try_into().unwrap(),
            BOB.try_into().unwrap(),
            DEFAULT_TOKEN_NAME.to_string(),
            100.into()
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

    let stream_id = state.do_create_stream(ALICE, BOB, 100, None);
    state.do_stop_stream(&state.root, &stream_id, Some(ERR_ACCESS_DENIED));

    state.do_stop_stream(&alice, &stream_id, None);
    state.do_stop_stream(&alice, &stream_id, Some(ERR_STREAM_NOT_ACTIVE));
    state.do_stop_stream(&bob, &stream_id, Some(ERR_STREAM_NOT_ACTIVE));
    state.do_stop_stream(&state.root, &stream_id, Some(ERR_STREAM_NOT_ACTIVE));
}

#[test]
fn create_stream_instant_deposit() {
    let state = State::new();
    let contract = &state.contract;

    let outcome = call!(
        state.root,
        contract.create_stream(
            ALICE.try_into().unwrap(),
            BOB.try_into().unwrap(),
            DEFAULT_TOKEN_NAME.to_string(),
            ONE_YOCTO.into()
        ),
        deposit = CREATE_STREAM_DEPOSIT + 123 * ONE_NEAR
    );
    assert!(outcome.is_ok());

    let stream_id: String = (&outcome.unwrap_json::<Base58CryptoHash>()).into();
    let stream = state.get_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR).into());
}

#[test]
fn create_stream_then_deposit() {
    let state = State::new();

    let stream_id = state.do_create_stream(ALICE, BOB, 100, None);
    state.do_deposit(&stream_id, 123 * ONE_NEAR, None);
    let stream = state.get_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR).into());
}

#[test]
fn withdraw_sanity() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_YOCTO, None);
    state.do_deposit(&stream_id, 123 * ONE_NEAR, None);
    let stream = state.get_stream(&stream_id).unwrap();
    assert!(stream.balance == (123 * ONE_NEAR).into());

    state.do_withdraw(alice, &stream_id, Some(ERR_ACCESS_DENIED));
    state.do_withdraw(bob, &stream_id, None);

    let stream = state.get_stream(&stream_id).unwrap();
    let stream_balance = u128::from(stream.balance);
    let stream_transferred = u128::from(stream.tokens_transferred);
    assert!(u128::from(stream.balance) < 123 * ONE_NEAR);
    assert!(u128::from(stream.balance) > 0);
    assert!(u128::from(stream.tokens_transferred) < 123 * ONE_NEAR);
    assert!(u128::from(stream.tokens_transferred) > 0);
    assert!(stream.status == "ACTIVE");

    state.do_withdraw(alice, &stream_id, Some(ERR_ACCESS_DENIED));
    state.do_withdraw(bob, &stream_id, None);

    let stream = state.get_stream(&stream_id).unwrap();
    assert!(u128::from(stream.balance) < stream_balance);
    assert!(u128::from(stream.balance) > 0);
    assert!(u128::from(stream.tokens_transferred) < 123 * ONE_NEAR);
    assert!(u128::from(stream.tokens_transferred) > stream_transferred);
    assert!(stream.status == "ACTIVE");
}

#[test]
fn withdraw_all() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);
    let total = 20 * ONE_NEAR;
    state.do_deposit(&stream_id, total, None);
    let stream = state.get_stream(&stream_id).unwrap();
    assert!(stream.balance == total.into());

    state.do_withdraw(alice, &stream_id, Some(ERR_ACCESS_DENIED));
    state.do_withdraw(bob, &stream_id, None);

    let stream = state.get_stream(&stream_id).unwrap();
    assert!(u128::from(stream.balance) < total);
    assert!(u128::from(stream.balance) > 0);
    assert!(u128::from(stream.tokens_transferred) < total);
    assert!(u128::from(stream.tokens_transferred) > 0);
    assert!(stream.status == "ACTIVE");

    for _ in 0..25 {
        state.sdk_sim_tick_tock();
    }

    state.do_withdraw(alice, &stream_id, Some(ERR_ACCESS_DENIED));
    state.do_withdraw(bob, &stream_id, None);

    let stream = state.get_stream(&stream_id).unwrap();
    assert!(stream.balance == 0.into());
    assert!(stream.tokens_transferred == total.into());
    assert!(stream.status == "FINISHED");
}

#[test]
fn withdraw_then_stop() {
    let mut state = State::new();
    state.create_alice();
    state.create_bob();
    let alice = state.accounts.get(ALICE).unwrap();
    let bob = state.accounts.get(BOB).unwrap();

    let stream_id = state.do_create_stream(ALICE, BOB, ONE_NEAR_PER_TICK, None);
    let total = 20 * ONE_NEAR;
    state.do_deposit(&stream_id, total, None);

    state.do_withdraw(alice, &stream_id, Some(ERR_ACCESS_DENIED));
    state.do_withdraw(bob, &stream_id, None);

    let stream = state.get_stream(&stream_id).unwrap();
    let stream_transferred = u128::from(stream.tokens_transferred);
    assert!(u128::from(stream.tokens_transferred) < total);
    assert!(u128::from(stream.tokens_transferred) > 0);

    state.do_stop_stream(alice, &stream_id, None);

    let stream = state.get_stream(&stream_id).unwrap();
    assert!(u128::from(stream.tokens_transferred) < total);
    assert!(u128::from(stream.tokens_transferred) > stream_transferred);
    assert!(stream.balance == 0.into());
    assert!(stream.status == "FINISHED");

    state.do_withdraw(bob, &stream_id, Some(ERR_STREAM_NOT_ACTIVE));

    state.do_stop_stream(alice, &stream_id, Some(ERR_STREAM_NOT_ACTIVE));
}

// tests:
// - multiple streams
// - stress-test
// - check graph validity in the end