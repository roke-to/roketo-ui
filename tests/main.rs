// TODO need more tests
//
// multiple streams same token
// multiple streams multiple token
// multiple withdraw
// multiple withdraw one fail revert
// stake/unstake
// stop reasons
// instant deposit
// dao calls
// exchanger calls
// access to stream actions
// test withdraw no storage deposit
// test stats
// streams are properly deleted from accounts
// dao token updated while streaming
// dao new token
// dao new token while streaming (unlisted -> listed)
// dao remove token
// unlisted tokens low decimals
// unlisted tokens high decimals
// unlisted tokens commissions
// deposit while streaming
// deposit invalid token into stream
// near->aurora transfers
// aurora create stream aurora
// aurora create stream listed
// aurora create stream unlisted
// aurora deposit
// aurora account ids / addresses
// aurora deployment + aurora tokens
// aurora ops
// exchanger take commission sanity
// test description
// test stream expiration

mod setup;

use crate::setup::*;

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
    let stream_id = e.create_stream(&users.alice, &users.charlie, &tokens.wnear, d(1, 23) + 1, 1);
    assert_eq!(
        *e.streams.get(&String::from(&stream_id)).unwrap(),
        125 * env::STORAGE_PRICE_PER_BYTE
    );

    let stream_id = e.create_stream(&users.alice, &users.charlie, &tokens.ndai, d(1, 18) + 1, 1);
    assert_eq!(
        *e.streams.get(&String::from(&stream_id)).unwrap(),
        125 * env::STORAGE_PRICE_PER_BYTE
    );

    let stream_id = e.create_stream(&users.alice, &users.charlie, &tokens.nusdt, d(1, 6) + 1, 1);
    assert_eq!(
        *e.streams.get(&String::from(&stream_id)).unwrap(),
        125 * env::STORAGE_PRICE_PER_BYTE
    );

    let stream_id = e.create_stream(
        &users.alice,
        &users.charlie,
        &tokens.aurora,
        d(1, 15) + 1,
        1,
    );
    assert_eq!(*e.streams.get(&String::from(&stream_id)).unwrap(), 0);

    e.account_deposit_near(&users.alice, d(1, 23));
    let stream_id = e.create_stream(&users.alice, &users.charlie, &tokens.dacha, d(1, 10), 1);
    assert_eq!(
        *e.streams.get(&String::from(&stream_id)).unwrap(),
        DEFAULT_STORAGE_BALANCE
    );
}

// Actual tests start here

#[test]
fn test_stream_sanity() {
    let (mut e, tokens, users) = basic_setup();

    let amount = d(101, 23);
    let stream_id = e.create_stream(
        &users.alice,
        &users.charlie,
        &tokens.wnear,
        amount,
        d(1, 23),
    );

    e.skip_time(100);

    let dao = e.get_dao();
    let dao_token = dao.tokens.get(&tokens.wnear.account_id()).unwrap();
    let amount_after_create = amount - dao_token.commission_on_create;
    let stream = e.get_stream(&stream_id);

    assert_eq!(stream.balance, amount_after_create);
    assert_eq!(stream.owner_id, users.alice.account_id());
    assert_eq!(stream.receiver_id, users.charlie.account_id());
    assert_eq!(stream.tokens_total_withdrawn, 0);
    assert_eq!(stream.status, StreamStatus::Active);

    e.stop_stream(&users.alice, &stream_id);

    let amount_after_stop =
        amount_after_create - dao_token.commission_coef.mult_safe(amount_after_create);
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.balance, 0);
    assert_eq!(stream.owner_id, users.alice.account_id());
    assert_eq!(stream.receiver_id, users.charlie.account_id());
    assert_eq!(stream.tokens_total_withdrawn, amount_after_create);
    assert_eq!(
        stream.status,
        StreamStatus::Finished {
            reason: StreamFinishReason::FinishedNatually
        }
    );

    assert_eq!(
        e.get_balance(&tokens.wnear, &users.charlie),
        amount_after_stop
    );
}

#[test]
fn test_stream_min_value() {
    let (mut e, tokens, users) = basic_setup();

    let amount = d(1, 6) + 3700;
    let stream_id = e.create_stream(
        &users.alice,
        &users.charlie,
        &tokens.nusdt,
        amount,
        MIN_STREAMING_SPEED,
    );

    // Zero token transfer
    e.withdraw(&users.charlie, &stream_id);
    let stream = e.get_stream(&stream_id);

    assert_eq!(stream.balance, 3700);
    assert_eq!(stream.tokens_total_withdrawn, 0);
    assert_eq!(stream.status, StreamStatus::Active);
    assert_eq!(e.get_balance(&tokens.nusdt, &users.charlie), 0);
    let dao = e.get_dao();
    let dao_token = dao.tokens.get(&tokens.nusdt.account_id()).unwrap();
    assert_eq!(dao_token.collected_commission, 0);

    e.skip_time(1);
    e.withdraw(&users.charlie, &stream_id);
    let stream = e.get_stream(&stream_id);

    assert_eq!(stream.balance, 3700 - 1);
    assert_eq!(stream.tokens_total_withdrawn, 1);
    assert_eq!(stream.status, StreamStatus::Active);
    assert_eq!(e.get_balance(&tokens.nusdt, &users.charlie), 0);
    let dao = e.get_dao();
    let dao_token = dao.tokens.get(&tokens.nusdt.account_id()).unwrap();
    assert_eq!(dao_token.collected_commission, 1);

    e.skip_time(150);
    e.withdraw(&users.charlie, &stream_id);
    let stream = e.get_stream(&stream_id);

    assert_eq!(stream.balance, 3700 - 1 - 150);
    assert_eq!(stream.tokens_total_withdrawn, 1 + 150);
    assert_eq!(stream.status, StreamStatus::Active);
    assert_eq!(e.get_balance(&tokens.nusdt, &users.charlie), 149);
    let dao = e.get_dao();
    let dao_token = dao.tokens.get(&tokens.nusdt.account_id()).unwrap();
    assert_eq!(dao_token.collected_commission, 2);

    e.skip_time(10000);
    e.withdraw(&users.charlie, &stream_id);
    let stream = e.get_stream(&stream_id);

    assert_eq!(stream.balance, 0);
    assert_eq!(stream.tokens_total_withdrawn, 3700);
    assert_eq!(
        stream.status,
        StreamStatus::Finished {
            reason: StreamFinishReason::FinishedNatually
        }
    );
    assert_eq!(e.get_balance(&tokens.nusdt, &users.charlie), 3700 - 6);
    let dao = e.get_dao();
    let dao_token = dao.tokens.get(&tokens.nusdt.account_id()).unwrap();
    assert_eq!(dao_token.collected_commission, 6);
}

#[test]
fn test_stream_max_value() {
    let (mut e, tokens, users) = basic_setup();

    let dao = e.get_dao();
    let mut dao_token = dao.tokens.get(&tokens.wnear.account_id()).unwrap().clone();
    dao_token.commission_coef = SafeFloat {
        val: 1_000_000_000 - 1,
        pow: -9,
    };
    dao_token.commission_on_create = 0;
    e.dao_update_token(dao_token);

    let amount = MAX_AMOUNT;
    let stream_id = e.create_stream(
        &users.alice,
        &users.charlie,
        &tokens.wnear,
        amount,
        MAX_STREAMING_SPEED,
    );

    e.skip_time(60 * 60 * 24 * 365 * 100); // 100 years

    e.withdraw(&users.charlie, &stream_id);

    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.tokens_total_withdrawn, MAX_AMOUNT);
    assert_eq!(
        stream.status,
        StreamStatus::Finished {
            reason: StreamFinishReason::FinishedNatually
        }
    );

    let dao = e.get_dao();
    let dao_token = dao.tokens.get(&tokens.wnear.account_id()).unwrap();
    assert_eq!(
        dao_token.collected_commission,
        dao_token.commission_coef.mult_safe(MAX_AMOUNT - 1) + 1
    );

    assert_eq!(
        e.get_balance(&tokens.wnear, &users.charlie),
        MAX_AMOUNT - dao_token.collected_commission
    );
}

#[test]
fn test_stream_max_value_min_speed() {
    let (mut e, tokens, users) = basic_setup();

    let dao = e.get_dao();
    let mut dao_token = dao.tokens.get(&tokens.wnear.account_id()).unwrap().clone();
    dao_token.commission_coef = SafeFloat {
        val: 1_000_000_000 - 1,
        pow: -9,
    };
    dao_token.commission_on_create = 0;
    e.dao_update_token(dao_token);

    let amount = MAX_AMOUNT;
    let stream_id = e.create_stream(
        &users.alice,
        &users.charlie,
        &tokens.wnear,
        amount,
        MIN_STREAMING_SPEED,
    );

    let hund_years = 60 * 60 * 24 * 365 * 100; // 100 years
    e.skip_time(hund_years as u64);

    e.withdraw(&users.charlie, &stream_id);

    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.tokens_total_withdrawn, hund_years);
    assert_eq!(stream.status, StreamStatus::Active);

    let dao = e.get_dao();
    let dao_token = dao.tokens.get(&tokens.wnear.account_id()).unwrap();
    assert_eq!(
        dao_token.collected_commission,
        dao_token.commission_coef.mult_safe(hund_years - 1) + 1
    );

    assert_eq!(
        e.get_balance(&tokens.wnear, &users.charlie),
        hund_years - dao_token.collected_commission
    );
}

#[test]
fn test_stream_start_pause_stop() {
    let (mut e, tokens, users) = basic_setup();

    let amount = d(1, 24);

    let stream_id = e.create_stream_ext(
        &users.alice,
        &users.charlie,
        &tokens.wnear,
        amount,
        d(1, 20),
        None,
        Some(false),
        None,
    );

    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Initialized);

    e.skip_time(10);
    assert!(!e.withdraw_err(&users.charlie, &stream_id).is_ok());

    e.skip_time(10);
    assert!(!e.start_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.charlie, &stream_id).is_ok());
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Initialized);

    e.skip_time(10);
    e.start_stream(&users.alice, &stream_id);
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Active);

    e.skip_time(10);
    assert!(!e.pause_stream_err(&users.bob, &stream_id).is_ok());
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Active);

    e.skip_time(10);
    assert_eq!(e.get_balance(&tokens.wnear, &users.charlie), 0);
    e.pause_stream(&users.charlie, &stream_id);
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Paused);
    assert_eq!(
        e.get_balance(&tokens.wnear, &users.charlie),
        d(20, 20) / 250 * 249
    );
    assert_eq!(stream.balance, amount - d(1, 23) - d(20, 20));

    e.skip_time(10);
    assert!(!e.pause_stream_err(&users.alice, &stream_id).is_ok());
    assert!(!e.pause_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.pause_stream_err(&users.charlie, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.charlie, &stream_id).is_ok());
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Paused);

    e.skip_time(10);
    let last_alice_balance = e.get_balance(&tokens.wnear, &users.alice);
    assert!(!e.stop_stream_err(&users.bob, &stream_id).is_ok());
    e.stop_stream(&users.charlie, &stream_id);
    let stream = e.get_stream(&stream_id);
    assert_eq!(
        stream.status,
        StreamStatus::Finished {
            reason: StreamFinishReason::StoppedByReceiver
        }
    );
    assert_eq!(
        e.get_balance(&tokens.wnear, &users.charlie),
        d(20, 20) / 250 * 249
    );
    assert_eq!(stream.balance, 0);
    assert_eq!(
        e.get_balance(&tokens.wnear, &users.alice),
        last_alice_balance + (amount - d(1, 23) - d(20, 20))
    );

    e.skip_time(10);
    assert!(!e.pause_stream_err(&users.alice, &stream_id).is_ok());
    assert!(!e.pause_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.pause_stream_err(&users.charlie, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.alice, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.charlie, &stream_id).is_ok());
    assert!(!e.stop_stream_err(&users.alice, &stream_id).is_ok());
    assert!(!e.stop_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.stop_stream_err(&users.charlie, &stream_id).is_ok());
    let stream = e.get_stream(&stream_id);
    assert_eq!(
        stream.status,
        StreamStatus::Finished {
            reason: StreamFinishReason::StoppedByReceiver
        }
    );
    assert_eq!(
        e.get_balance(&tokens.wnear, &users.charlie),
        d(20, 20) / 250 * 249
    );
    assert_eq!(stream.balance, 0);
    assert_eq!(
        e.get_balance(&tokens.wnear, &users.alice),
        last_alice_balance + (amount - d(1, 23) - d(20, 20))
    );
}

#[test]
fn test_stream_unlisted_sanity() {
    let (mut e, tokens, users) = basic_setup();

    let amount = d(1, 20);
    let token = tokens.dacha;

    let last_alice_balance = e.get_balance(&token, &users.alice);

    assert_eq!(
        e.create_stream_ext_err(
            &users.alice,
            &users.charlie,
            &token,
            amount,
            d(1, 16),
            None,
            None,
            None,
        ),
        U128(0)
    );
    assert_eq!(last_alice_balance, e.get_balance(&token, &users.alice));

    let dao = e.get_dao();

    assert!(!users
        .alice
        .function_call(
            e.contract.contract.account_deposit_near(),
            MAX_GAS,
            dao.commission_unlisted - 1,
        )
        .is_ok());

    let account: Result<AccountView, ContractError> = e
        .near
        .view_method_call(e.contract.contract.get_account(users.alice.account_id()))
        .unwrap_json();
    assert!(account.is_err());

    assert!(users
        .alice
        .function_call(
            e.contract.contract.account_deposit_near(),
            MAX_GAS,
            dao.commission_unlisted,
        )
        .is_ok());

    let account = e.get_account(&users.alice);
    assert_eq!(account.deposit, dao.commission_unlisted);

    let stream_id = e.create_stream(&users.alice, &users.charlie, &token, amount, d(1, 16));

    let account = e.get_account(&users.alice);
    assert_eq!(account.deposit, 0);
    assert_eq!(
        last_alice_balance - amount,
        e.get_balance(&token, &users.alice)
    );

    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Active);
    assert_eq!(stream.token_account_id, token.account_id());
}

#[test]
fn test_stream_unlisted_start_pause_stop() {
    let (mut e, tokens, users) = basic_setup();

    let amount = d(1, 20);
    let token = tokens.dacha;

    let dao = e.get_dao();
    e.account_deposit_near(&users.alice, dao.commission_unlisted);

    let stream_id = e.create_stream_ext(
        &users.alice,
        &users.charlie,
        &token,
        amount,
        d(1, 16),
        None,
        Some(false),
        None,
    );

    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Initialized);

    e.skip_time(10);
    assert!(!e.withdraw_err(&users.charlie, &stream_id).is_ok());

    e.skip_time(10);
    assert!(!e.start_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.charlie, &stream_id).is_ok());
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Initialized);

    e.skip_time(10);
    e.start_stream(&users.alice, &stream_id);
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Active);

    e.skip_time(10);
    assert!(!e.pause_stream_err(&users.bob, &stream_id).is_ok());
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Active);

    e.skip_time(10);
    assert_eq!(e.get_balance(&token, &users.charlie), 0);
    e.pause_stream(&users.charlie, &stream_id);
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Paused);
    assert_eq!(e.get_balance(&token, &users.charlie), d(20, 16));
    assert_eq!(stream.balance, amount - d(20, 16));

    e.skip_time(10);
    assert!(!e.pause_stream_err(&users.alice, &stream_id).is_ok());
    assert!(!e.pause_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.pause_stream_err(&users.charlie, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.charlie, &stream_id).is_ok());
    let stream = e.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Paused);

    e.skip_time(10);
    let last_alice_balance = e.get_balance(&token, &users.alice);
    assert!(!e.stop_stream_err(&users.bob, &stream_id).is_ok());
    e.stop_stream(&users.charlie, &stream_id);
    let stream = e.get_stream(&stream_id);
    assert_eq!(
        stream.status,
        StreamStatus::Finished {
            reason: StreamFinishReason::StoppedByReceiver
        }
    );
    assert_eq!(e.get_balance(&token, &users.charlie), d(20, 16));
    assert_eq!(stream.balance, 0);
    assert_eq!(
        e.get_balance(&token, &users.alice),
        last_alice_balance + (amount - d(20, 16))
    );

    e.skip_time(10);
    assert!(!e.pause_stream_err(&users.alice, &stream_id).is_ok());
    assert!(!e.pause_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.pause_stream_err(&users.charlie, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.alice, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.start_stream_err(&users.charlie, &stream_id).is_ok());
    assert!(!e.stop_stream_err(&users.alice, &stream_id).is_ok());
    assert!(!e.stop_stream_err(&users.bob, &stream_id).is_ok());
    assert!(!e.stop_stream_err(&users.charlie, &stream_id).is_ok());
    let stream = e.get_stream(&stream_id);
    assert_eq!(
        stream.status,
        StreamStatus::Finished {
            reason: StreamFinishReason::StoppedByReceiver
        }
    );
    assert_eq!(e.get_balance(&token, &users.charlie), d(20, 16));
    assert_eq!(stream.balance, 0);
    assert_eq!(
        e.get_balance(&token, &users.alice),
        last_alice_balance + (amount - d(20, 16))
    );
}

#[test]
fn test_withdraw_invalid() {
    let (mut e, tokens, users) = basic_setup();
    let token = tokens.wnear;
    let amount = d(1, 26);

    let stream_id_1 = e.create_stream(&users.alice, &users.charlie, &token, amount, d(1, 20));

    let stream_id_2 = e.create_stream(&users.bob, &users.dude, &token, amount, d(1, 20));

    e.skip_time(100);

    assert_eq!(e.get_balance(&token, &users.charlie), 0);
    assert_eq!(e.get_balance(&token, &users.dude), 0);

    // wrong actor
    assert!(!e
        .withdraw_ext_err(&users.charlie, &[&stream_id_1, &stream_id_2])
        .is_ok());
    assert!(!e
        .withdraw_ext_err(&users.charlie, &[&stream_id_2, &stream_id_1])
        .is_ok());

    assert_eq!(e.get_balance(&token, &users.charlie), 0);
    assert_eq!(e.get_balance(&token, &users.dude), 0);

    let stream_1 = e.get_stream(&stream_id_1);
    assert_eq!(stream_1.balance, d(1, 26) - d(1, 23));
    assert_eq!(stream_1.tokens_total_withdrawn, 0);
    assert_eq!(stream_1.status, StreamStatus::Active);

    let stream_2 = e.get_stream(&stream_id_2);
    assert_eq!(stream_2.balance, d(1, 26) - d(1, 23));
    assert_eq!(stream_2.tokens_total_withdrawn, 0);
    assert_eq!(stream_2.status, StreamStatus::Active);

    // should work
    assert!(e
        .withdraw_ext_err(&users.charlie, &[&stream_id_1, &stream_id_1])
        .is_ok());

    assert_eq!(
        e.get_balance(&token, &users.charlie),
        d(100, 20) / 250 * 249
    );
    assert_eq!(e.get_balance(&token, &users.dude), 0);

    let stream_1 = e.get_stream(&stream_id_1);
    assert_eq!(stream_1.balance, d(1, 26) - d(1, 23) - d(100, 20));
    assert_eq!(stream_1.tokens_total_withdrawn, d(100, 20));
    assert_eq!(stream_1.status, StreamStatus::Active);

    let stream_2 = e.get_stream(&stream_id_2);
    assert_eq!(stream_2.balance, d(1, 26) - d(1, 23));
    assert_eq!(stream_2.tokens_total_withdrawn, 0);
    assert_eq!(stream_2.status, StreamStatus::Active);

    // not enough gas
    assert!(!e
        .withdraw_ext_err(&users.dude, &vec![&stream_id_2; 100])
        .is_ok());

    assert_eq!(
        e.get_balance(&token, &users.charlie),
        d(100, 20) / 250 * 249
    );
    assert_eq!(e.get_balance(&token, &users.dude), 0);

    let stream_1 = e.get_stream(&stream_id_1);
    assert_eq!(stream_1.balance, d(1, 26) - d(1, 23) - d(100, 20));
    assert_eq!(stream_1.tokens_total_withdrawn, d(100, 20));
    assert_eq!(stream_1.status, StreamStatus::Active);

    let stream_2 = e.get_stream(&stream_id_2);
    assert_eq!(stream_2.balance, d(1, 26) - d(1, 23));
    assert_eq!(stream_2.tokens_total_withdrawn, 0);
    assert_eq!(stream_2.status, StreamStatus::Active);

    // ok
    assert!(e
        .withdraw_ext_err(&users.dude, &vec![&stream_id_2; 10])
        .is_ok());

    assert_eq!(
        e.get_balance(&token, &users.charlie),
        d(100, 20) / 250 * 249
    );
    assert_eq!(e.get_balance(&token, &users.dude), d(100, 20) / 250 * 249);

    let stream_1 = e.get_stream(&stream_id_1);
    assert_eq!(stream_1.balance, d(1, 26) - d(1, 23) - d(100, 20));
    assert_eq!(stream_1.tokens_total_withdrawn, d(100, 20));
    assert_eq!(stream_1.status, StreamStatus::Active);

    let stream_2 = e.get_stream(&stream_id_2);
    assert_eq!(stream_2.balance, d(1, 26) - d(1, 23) - d(100, 20));
    assert_eq!(stream_2.tokens_total_withdrawn, d(100, 20));
    assert_eq!(stream_2.status, StreamStatus::Active);
}

#[test]
fn test_withdraw_multiple() {
    let (mut e, tokens, users) = basic_setup();
    e.mint_tokens(&tokens, &users.charlie);
    let token = tokens.wnear;
    let amount = d(1, 26);

    let stream_id_1 = e.create_stream(&users.alice, &users.dude, &token, amount, d(1, 20));
    let stream_id_2 = e.create_stream(&users.bob, &users.dude, &token, amount, d(1, 21));
    let stream_id_3 = e.create_stream(&users.charlie, &users.dude, &token, amount, d(1, 22));

    e.skip_time(100);

    assert_eq!(e.get_balance(&token, &users.dude), 0);

    assert!(!e
        .withdraw_ext_err(&users.alice, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());
    assert!(!e
        .withdraw_ext_err(&users.bob, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());
    assert!(!e
        .withdraw_ext_err(&users.charlie, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());
    assert!(!e
        .withdraw_ext_err(&users.eve, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());

    // ok - withdraw all 3
    assert!(e
        .withdraw_ext_err(&users.dude, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());

    assert_eq!(
        e.get_balance(&token, &users.dude),
        (d(100, 20) + d(100, 21) + d(100, 22)) / 250 * 249
    );

    let stream_1 = e.get_stream(&stream_id_1);
    assert_eq!(stream_1.balance, d(1, 26) - d(1, 23) - d(100, 20));
    assert_eq!(stream_1.tokens_total_withdrawn, d(100, 20));
    assert_eq!(stream_1.status, StreamStatus::Active);

    let stream_2 = e.get_stream(&stream_id_2);
    assert_eq!(stream_2.balance, d(1, 26) - d(1, 23) - d(100, 21));
    assert_eq!(stream_2.tokens_total_withdrawn, d(100, 21));
    assert_eq!(stream_2.status, StreamStatus::Active);

    let stream_3 = e.get_stream(&stream_id_3);
    assert_eq!(stream_3.balance, d(1, 26) - d(1, 23) - d(100, 22));
    assert_eq!(stream_3.tokens_total_withdrawn, d(100, 22));
    assert_eq!(stream_3.status, StreamStatus::Active);

    e.skip_time(100);

    assert!(!e
        .withdraw_ext_err(&users.alice, &[&stream_id_3, &stream_id_2])
        .is_ok());
    assert!(!e
        .withdraw_ext_err(&users.bob, &[&stream_id_3, &stream_id_2])
        .is_ok());
    assert!(!e
        .withdraw_ext_err(&users.charlie, &[&stream_id_3, &stream_id_2])
        .is_ok());
    assert!(!e
        .withdraw_ext_err(&users.eve, &[&stream_id_3, &stream_id_2])
        .is_ok());

    // ok - withdraw only 2 of 3
    assert!(e
        .withdraw_ext_err(&users.dude, &[&stream_id_3, &stream_id_2])
        .is_ok());

    assert_eq!(
        e.get_balance(&token, &users.dude),
        (d(100, 20) + d(200, 21) + d(200, 22)) / 250 * 249
    );

    let stream_1 = e.get_stream(&stream_id_1);
    assert_eq!(stream_1.balance, d(1, 26) - d(1, 23) - d(100, 20));
    assert_eq!(stream_1.tokens_total_withdrawn, d(100, 20));
    assert_eq!(stream_1.status, StreamStatus::Active);

    let stream_2 = e.get_stream(&stream_id_2);
    assert_eq!(stream_2.balance, d(1, 26) - d(1, 23) - d(200, 21));
    assert_eq!(stream_2.tokens_total_withdrawn, d(200, 21));
    assert_eq!(stream_2.status, StreamStatus::Active);

    let stream_3 = e.get_stream(&stream_id_3);
    assert_eq!(stream_3.balance, d(1, 26) - d(1, 23) - d(200, 22));
    assert_eq!(stream_3.tokens_total_withdrawn, d(200, 22));
    assert_eq!(stream_3.status, StreamStatus::Active);
}

#[test]
fn test_withdraw_multiple_allow_cron() {
    let (mut e, tokens, users) = basic_setup();
    let token = tokens.wnear;
    let amount = d(1, 26);

    let stream_id_1 = e.create_stream(&users.alice, &users.charlie, &token, amount, d(1, 20));
    let stream_id_2 = e.create_stream(&users.alice, &users.dude, &token, amount, d(1, 21));
    let stream_id_3 = e.create_stream(&users.alice, &users.eve, &token, amount, d(1, 22));

    e.skip_time(100);

    assert_eq!(e.get_balance(&token, &users.charlie), 0);
    assert_eq!(e.get_balance(&token, &users.dude), 0);
    assert_eq!(e.get_balance(&token, &users.eve), 0);

    assert!(!e
        .withdraw_ext_err(&users.eve, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());

    e.account_update_cron_flag(&users.charlie, true);
    e.account_update_cron_flag(&users.dude, true);

    assert!(!e
        .withdraw_ext_err(&users.alice, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());
    assert!(!e
        .withdraw_ext_err(&users.bob, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());
    assert!(!e
        .withdraw_ext_err(&users.charlie, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());
    assert!(!e
        .withdraw_ext_err(&users.dude, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());

    // ok
    assert!(e
        .withdraw_ext_err(&users.eve, &[&stream_id_1, &stream_id_2, &stream_id_3])
        .is_ok());

    assert_eq!(
        e.get_balance(&token, &users.charlie),
        d(100, 20) / 250 * 249
    );
    assert_eq!(e.get_balance(&token, &users.dude), d(100, 21) / 250 * 249);
    assert_eq!(e.get_balance(&token, &users.eve), d(100, 22) / 250 * 249);

    let stream_1 = e.get_stream(&stream_id_1);
    assert_eq!(stream_1.balance, d(1, 26) - d(1, 23) - d(100, 20));
    assert_eq!(stream_1.tokens_total_withdrawn, d(100, 20));
    assert_eq!(stream_1.status, StreamStatus::Active);

    let stream_2 = e.get_stream(&stream_id_2);
    assert_eq!(stream_2.balance, d(1, 26) - d(1, 23) - d(100, 21));
    assert_eq!(stream_2.tokens_total_withdrawn, d(100, 21));
    assert_eq!(stream_2.status, StreamStatus::Active);

    let stream_3 = e.get_stream(&stream_id_3);
    assert_eq!(stream_3.balance, d(1, 26) - d(1, 23) - d(100, 22));
    assert_eq!(stream_3.tokens_total_withdrawn, d(100, 22));
    assert_eq!(stream_3.status, StreamStatus::Active);
}
