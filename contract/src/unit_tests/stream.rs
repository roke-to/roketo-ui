#[cfg(test)]
mod tests {
    use crate::*;
    use near_sdk::test_utils::test_env::{alice, bob};
    use near_sdk::{env, test_utils::VMContextBuilder, testing_env};

    fn new_stream() -> Stream {
        Stream {
            id: env::sha256(&[44, 55, 66]).as_slice().try_into().unwrap(),
            description: Some("blah".to_string()),
            owner_id: alice(),
            receiver_id: bob(),
            token_account_id: "token.near".parse().unwrap(),
            timestamp_created: env::block_timestamp(),
            last_action: env::block_timestamp(),
            balance: 1_000_000_000_000_000_000_000_000_000, // 1e27
            tokens_per_sec: 1_000_000_000_000_000_000_000_000, // 1e24
            status: StreamStatus::Active,
            tokens_total_withdrawn: 0,
            cliff: None,
            is_expirable: true,
        }
    }

    #[test]
    fn test_available_to_withdraw_all() {
        testing_env!(VMContextBuilder::new()
            .block_timestamp(1633333333000000000)
            .build());
        let stream = new_stream();
        assert_eq!(stream.available_to_withdraw(), 0);
        // 4 months passed
        testing_env!(VMContextBuilder::new()
            .block_timestamp(1643333333000000000)
            .build());
        assert_eq!(stream.available_to_withdraw(), stream.balance);
    }

    #[test]
    fn test_process_withdraw_instant() {
        testing_env!(VMContextBuilder::new()
            .block_timestamp(1633333333000000000)
            .build());
        let mut stream = new_stream();
        let original_balance = stream.balance;
        assert_eq!(stream.available_to_withdraw(), 0);
        let (withdrawn, commission) =
            stream.process_withdraw(&Token::new_unlisted(&"token1.near".parse().unwrap()));
        assert_eq!(withdrawn, 0);
        assert_eq!(commission, 0);
        assert_eq!(stream.available_to_withdraw(), 0);
        assert_eq!(stream.balance, original_balance);
        assert_eq!(stream.tokens_total_withdrawn, 0);
    }

    #[test]
    fn test_process_withdraw_precise() {
        testing_env!(VMContextBuilder::new()
            .block_timestamp(1633333333000000000)
            .build());
        let mut stream = new_stream();
        let original_balance = stream.balance;
        assert_eq!(stream.available_to_withdraw(), 0);
        for i in 1..=1000u128 {
            testing_env!(VMContextBuilder::new()
                .block_timestamp(1633333333000000000 + i as u64 * 1000000000)
                .build());
            assert_eq!(stream.status, StreamStatus::Active);
            assert_eq!(stream.available_to_withdraw(), stream.tokens_per_sec);
            let (withdrawn, commission) =
                stream.process_withdraw(&Token::new_unlisted(&"token1.near".parse().unwrap()));
            assert_eq!(withdrawn, stream.tokens_per_sec);
            assert_eq!(commission, 0);
            assert_eq!(stream.available_to_withdraw(), 0);
            assert_eq!(stream.balance, original_balance - i * stream.tokens_per_sec);
            assert_eq!(stream.tokens_total_withdrawn, i * stream.tokens_per_sec);
        }
        assert_eq!(
            stream.status,
            StreamStatus::Finished {
                reason: StreamFinishReason::FinishedNatually
            }
        );
        // 1 more second
        testing_env!(VMContextBuilder::new()
            .block_timestamp(1643334333000000000)
            .build());
        assert_eq!(stream.available_to_withdraw(), 0);
        let (withdrawn, commission) =
            stream.process_withdraw(&Token::new_unlisted(&"token1.near".parse().unwrap()));
        assert_eq!(withdrawn, 0);
        assert_eq!(commission, 0);
        assert_eq!(stream.available_to_withdraw(), 0);
        assert_eq!(stream.balance, 0);
        assert_eq!(stream.tokens_total_withdrawn, original_balance);
        assert_eq!(
            stream.status,
            StreamStatus::Finished {
                reason: StreamFinishReason::FinishedNatually
            }
        );
    }

    // TODO add tests with commission and fractions
    // TODO test deposit invalid token
    // TODO save stream with listed token
}
