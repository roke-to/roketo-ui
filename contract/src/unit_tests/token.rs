#[cfg(test)]
mod tests {
    use crate::*;

    #[test]
    fn test_commission_unlisted() {
        let token = Token::new_unlisted(&"token.near".parse().unwrap());
        let balance: Balance = 1000000000;
        let (left, commission) = token.apply_commission(balance);
        assert_eq!(left, balance);
        assert_eq!(commission, 0);
        assert_eq!(balance, left + commission);
    }

    #[test]
    fn test_commission_1_percent() {
        let mut token = Token::new_unlisted(&"token.near".parse().unwrap());
        token.commission_numerator = 1;
        token.commission_denominator = 100;
        let balance: Balance = 1000000000;
        let (left, commission) = token.apply_commission(balance);
        assert_eq!(left, balance / 100 * 99);
        assert_eq!(commission, balance / 100);
        assert_eq!(balance, left + commission);
    }

    #[test]
    fn test_commission_100_percent() {
        let mut token = Token::new_unlisted(&"token.near".parse().unwrap());
        token.commission_numerator = 1;
        token.commission_denominator = 1;
        let balance: Balance = 123456;
        let (left, commission) = token.apply_commission(balance);
        assert_eq!(left, 0);
        assert_eq!(commission, balance);
        assert_eq!(balance, left + commission);
    }

    #[test]
    fn test_transfer_to_aurora() {
        let contract = Contract::new("dao.near".parse().unwrap());
        let aurora_address =
            AccountId::new_unchecked("f5cfbc74057c610c8ef151a439252680ac68c6dc".to_string());
        assert!(Contract::is_aurora_address(&aurora_address));
        assert!(contract
            .ft_transfer(
                &Token::new_unlisted(&"token.near".parse().unwrap()),
                &aurora_address,
                123456,
                None
            )
            .is_ok());
        assert!(contract
            .ft_transfer(
                &Token::new_unlisted(&Contract::aurora_account_id()),
                &aurora_address,
                123456,
                None
            )
            .is_ok());
    }
}
