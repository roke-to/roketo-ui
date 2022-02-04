#[cfg(test)]
mod tests {
    use crate::*;
    use near_sdk::test_utils::test_env::{alice, bob, carol};
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
            is_expirable: true,
        }
    }

    #[test]
    fn test_save_extract_stream() {
        let mut contract = Contract::new("dao.near".parse().unwrap());
        let stream_id = new_stream().id;
        assert!(contract.extract_stream(&stream_id).is_err());
        assert!(contract
            .save_stream(
                &env::sha256(&[44, 55]).as_slice().try_into().unwrap(),
                new_stream()
            )
            .is_err());
        assert!(contract
            .save_stream(&stream_id.clone(), new_stream())
            .is_ok());
        assert!(contract
            .save_stream(&stream_id.clone(), new_stream())
            .is_err());
        assert!(contract.extract_stream(&stream_id).is_ok());
        assert!(contract.extract_stream(&stream_id).is_err());
    }

    #[test]
    fn test_create_stream() {
        let mut contract = Contract::new("dao.near".parse().unwrap());
        testing_env!(VMContextBuilder::new().signer_account_id(carol()).build());
        let stream = new_stream();
        assert_eq!(
            contract.process_create_stream(
                stream.owner_id,
                stream.description,
                stream.receiver_id,
                Token::new_unlisted(&stream.token_account_id),
                stream.balance,
                stream.tokens_per_sec,
                None,
                None,
            ),
            Err(ContractError::UnreachableAccount {
                account_id: carol()
            })
        );

        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(carol())
            .attached_deposit(DEFAULT_COMMISSION_UNLISTED)
            .build());
        contract.account_deposit_near();
        let stream = new_stream();
        testing_env!(VMContextBuilder::new().signer_account_id(carol()).build());
        assert!(contract
            .process_create_stream(
                stream.owner_id,
                stream.description,
                stream.receiver_id,
                Token::new_unlisted(&stream.token_account_id),
                stream.balance,
                stream.tokens_per_sec,
                None,
                None,
            )
            .is_ok());
    }

    #[test]
    fn test_create_stream_to_aurora() {
        let mut contract = Contract::new("dao.near".parse().unwrap());
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(carol())
            .attached_deposit(DEFAULT_COMMISSION_UNLISTED)
            .build());
        contract.account_deposit_near();
        let mut stream = new_stream();
        stream.receiver_id =
            AccountId::new_unchecked("f5cfbc74057c610c8ef151a439252680ac68c6dc".to_string());
        testing_env!(VMContextBuilder::new().signer_account_id(carol()).build());
        assert!(contract
            .process_create_stream(
                stream.owner_id,
                stream.description,
                stream.receiver_id,
                Token::new_unlisted(&stream.token_account_id),
                stream.balance,
                stream.tokens_per_sec,
                None,
                None,
            )
            .is_ok());
    }
}
