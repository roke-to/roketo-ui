// TODO need more tests
//
// multiple streams same token
// multiple streams multiple token
// instant deposit
// dao calls
// exchanger calls
// test withdraw no storage deposit
// test stats
// dao token updated while streaming
// dao new token
// dao new token while streaming (unlisted -> listed)
// dao remove token
// unlisted tokens sanity
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
        amount_after_create - dao_token.commission_coef.mult(amount_after_create);
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
    dao_token.commission_coef = LimitedFloat {
        value: 99999999,
        decimals: -8,
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
        dao_token.commission_coef.mult(MAX_AMOUNT)
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
    dao_token.commission_coef = LimitedFloat {
        value: 99999999,
        decimals: -8,
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
        dao_token.commission_coef.mult(hund_years)
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
