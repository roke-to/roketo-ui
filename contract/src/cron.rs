use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Debug, Serialize, Deserialize, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub struct CronTask {
    pub owner_id: AccountId,
    pub contract_id: AccountId,
    pub function_id: String,
    pub cadence: String,
    pub recurring: bool,
    pub total_deposit: U128,
    pub deposit: U128,
    pub gas: Gas,
    pub arguments: Vec<u8>,
}

#[ext_contract(ext_croncat)]
pub trait ExtCroncat {
    fn get_tasks(&self, offset: Option<u64>) -> (Vec<Base64VecU8>, U128);
    fn get_all_tasks(&self, slot: Option<U128>) -> Vec<Task>;
    fn get_task(&self, task_hash: Base64VecU8) -> Task;
    fn create_task(
        &mut self,
        contract_id: String,
        function_id: String,
        cadence: String,
        recurring: Option<bool>,
        deposit: Option<U128>,
        gas: Option<Gas>,
        arguments: Option<Vec<u8>>,
    ) -> Base64VecU8;
    fn update_task(
        &mut self,
        task_hash: Base64VecU8,
        cadence: Option<String>,
        recurring: Option<bool>,
        deposit: Option<U128>,
        gas: Option<Gas>,
        arguments: Option<Vec<u8>>,
    );
    fn remove_task(&mut self, task_hash: Base64VecU8);
    fn proxy_call(&mut self);
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct CronAccount {
    pub account_id: String,
}

impl Xyiming {
    pub(crate) fn create_task(&mut self, account_id: String) -> Promise {
        let cron_account_id = CronAccount { account_id };
        ext_croncat::create_task(
            env::current_account_id(),
            "update_account".to_string(),
            "*/5 * * * * *".to_string(),
            Some(true),
            None,
            Some(GAS_FOR_TICK_CALL), // 250 Tgas
            Some(
                serde_json::to_string(&cron_account_id)
                    .unwrap()
                    .as_bytes()
                    .to_vec(),
            ),
            &"cron.in.testnet",
            ONE_NEAR,
            GAS_FOR_TICK_CALL,
        )
    }
}
