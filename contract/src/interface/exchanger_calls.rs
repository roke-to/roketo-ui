use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn exchanger_update_commission_on_create(
        &mut self,
        token_account_id: AccountId,
        commission_on_create: U128,
    ) {
        self.dao
            .check_exchanger(&env::predecessor_account_id())
            .unwrap();

        let mut token = self.dao.get_token(&token_account_id).unwrap();
        token.commission_on_create = commission_on_create.into();
        self.dao.tokens.insert(token_account_id, token);
    }

    #[payable]
    pub fn exchanger_update_eth_near_ratio(&mut self, ratio: LimitedFloat) {
        self.dao
            .check_exchanger(&env::predecessor_account_id())
            .unwrap();

        ratio.assert_valid();
        self.dao.eth_near_ratio = ratio;
    }

    #[payable]
    pub fn exchanger_withdraw_ft(&mut self, token_account_id: AccountId, amount: U128) -> Promise {
        self.dao
            .check_exchanger(&env::predecessor_account_id())
            .unwrap();

        let amount = amount.into();
        let mut token = self.dao.get_token(&token_account_id).unwrap();
        assert!(amount <= token.collected_commission);
        token.collected_commission -= amount;
        self.dao.tokens.insert(token_account_id, token.clone());

        // In case of gas failure ask DAO to refund
        // and be smarter next time, dickhead
        self.ft_transfer(&token, &env::predecessor_account_id(), amount, false)
            .unwrap()
    }
}
