use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn start_stream(&mut self, stream_id: Base58CryptoHash) {
        assert_one_yocto();
        self.process_start_stream(&env::signer_account_id(), stream_id.into())
            .unwrap()
    }

    #[payable]
    pub fn pause_stream(&mut self, stream_id: Base58CryptoHash) -> Vec<Promise> {
        let stream_id = stream_id.into();
        let stream_view = self.view_stream(&stream_id).unwrap();
        let token = self
            .dao
            .get_token_or_unlisted(&stream_view.token_account_id);
        let storage_balance_needed = max(
            if Contract::is_aurora_address(&stream_view.receiver_id) {
                // Receiver is at aurora, need to storage deposit
                0
            } else {
                token.storage_balance_needed
            },
            // In case of token.storage_balance_needed == 0, it should be at least 1 yocto
            ONE_YOCTO,
        );
        assert!(env::attached_deposit() >= storage_balance_needed);

        self.process_pause_stream(&env::signer_account_id(), stream_id.into())
            .unwrap()
    }

    #[payable]
    pub fn stop_stream(&mut self, stream_id: Base58CryptoHash) -> Vec<Promise> {
        let stream_id = stream_id.into();
        let stream_view = self.view_stream(&stream_id).unwrap();
        let token = self
            .dao
            .get_token_or_unlisted(&stream_view.token_account_id);

        let storage_balance_needed = max(
            if Contract::is_aurora_address(&stream_view.receiver_id) {
                // Receiver is at aurora, need to storage deposit
                0
            } else {
                // Mult of 2 is needed as stop may cause two transfers with two storage deposits
                2 * token.storage_balance_needed
            },
            // In case of token.storage_balance_needed == 0, it should be at least 1 yocto
            ONE_YOCTO,
        );
        assert!(env::attached_deposit() >= storage_balance_needed);

        self.process_stop_stream(&env::signer_account_id(), stream_id)
            .unwrap()
    }

    #[payable]
    pub fn withdraw(
        &mut self,
        stream_ids: Vec<Base58CryptoHash>,
        is_storage_deposit_needed: Option<bool>,
    ) -> Vec<Promise> {
        let is_storage_deposit_needed = match is_storage_deposit_needed {
            Some(value) => value,
            None => true,
        };

        if is_storage_deposit_needed {
            let storage_balance_needed = max(
                stream_ids
                    .iter()
                    .map(|&stream_id| {
                        let stream_view = self.view_stream(&stream_id.into()).unwrap();
                        let token = self
                            .dao
                            .get_token_or_unlisted(&stream_view.token_account_id);
                        if Contract::is_aurora_address(&stream_view.receiver_id) {
                            // Receiver is at aurora, need no storage deposit
                            0
                        } else {
                            token.storage_balance_needed
                        }
                    })
                    .sum::<Balance>(),
                // In case of token.storage_balance_needed == 0, it should be at least 1 yocto
                ONE_YOCTO,
            );
            assert!(env::attached_deposit() >= storage_balance_needed);
        }

        stream_ids
            .iter()
            .map(|&stream_id| {
                self.process_withdraw(
                    &env::signer_account_id(),
                    stream_id.into(),
                    is_storage_deposit_needed,
                )
                .unwrap()
            })
            .flatten()
            .collect()
    }

    #[payable]
    pub fn change_receiver(
        &mut self,
        stream_id: Base58CryptoHash,
        receiver_id: AccountId,
    ) -> Vec<Promise> {
        let stream_id = stream_id.into();
        let stream_view = self.view_stream(&stream_id).unwrap();

        assert_eq!(env::signer_account_id(), stream_view.receiver_id);

        let token = self
            .dao
            .get_token_or_unlisted(&stream_view.token_account_id);
        let storage_balance_needed = max(
            if Contract::is_aurora_address(&stream_view.receiver_id) {
                // Receiver is at aurora, need to storage deposit
                0
            } else {
                token.storage_balance_needed
            },
            // In case of token.storage_balance_needed == 0, it should be at least 1 yocto
            ONE_YOCTO,
        );
        assert!(env::attached_deposit() >= storage_balance_needed);

        self.process_change_receiver(
            &stream_view.receiver_id,
            stream_id.into(),
            receiver_id,
            storage_balance_needed,
        )
        .unwrap()
    }
}