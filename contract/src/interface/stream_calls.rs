use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn start_stream(
        &mut self,
        stream_id: Base58CryptoHash,
    ) -> Result<Vec<Promise>, ContractError> {
        assert_one_yocto();
        self.process_start_stream(stream_id.into())
    }

    #[payable]
    pub fn pause_stream(
        &mut self,
        stream_id: Base58CryptoHash,
    ) -> Result<Vec<Promise>, ContractError> {
        assert_one_yocto();
        self.process_pause_stream(stream_id.into())
    }

    #[payable]
    pub fn stop_stream(
        &mut self,
        stream_id: Base58CryptoHash,
    ) -> Result<Vec<Promise>, ContractError> {
        assert_one_yocto();
        self.process_stop_stream(stream_id.into())
    }

    #[payable]
    pub fn withdraw(&mut self, stream_id: Base58CryptoHash) -> Result<Vec<Promise>, ContractError> {
        self.process_withdraw(stream_id.into())
    }
}
