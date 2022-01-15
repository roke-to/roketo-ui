use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Serialize, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum ContractError {
    Unknown,
    CallerIsNotDao {
        expected: AccountId,
        received: AccountId,
    },
    CallerIsNotStreamOwner {
        expected: AccountId,
        received: AccountId,
    },
    CallerIsNotStreamActor {
        owner: AccountId,
        receiver: AccountId,
        caller: AccountId,
    },
    UnknownExchanger {
        received: AccountId,
    },
    UnknownToken {
        received: AccountId,
    },
    InvalidToken {
        expected: AccountId,
        received: AccountId,
    },
    ZeroTokenTransfer,
    ZeroBalanceStreamStart,
    CronCallsForbidden,
    CannotStartStream {
        stream_status: StreamStatus,
    },
    CannotPauseStream {
        stream_status: StreamStatus,
    },
    CannotStopStream {
        stream_status: StreamStatus,
    },
    CannotWithdraw {
        stream_status: StreamStatus,
    },
    InvalidCommission,
    InsufficientGas {
        expected: Gas,
        left: Gas,
    },
    InsufficientDeposit {
        expected: Balance,
        received: Balance,
    },
    InsufficientBalance {
        token_account_id: AccountId,
        requested: Balance,
        left: Balance,
    },
    InsufficientNearBalance {
        requested: Balance,
        left: Balance,
    },
    UnreachableAccount {
        account_id: AccountId,
    },
    UnreachableStream {
        stream_id: Base58CryptoHash,
    },
    StreamTerminated {
        stream_id: Base58CryptoHash,
    },
    StreamExpired {
        stream_id: Base58CryptoHash,
    },
    DescriptionTooLong {
        max_description_len: usize,
        received: usize,
    },
    InvalidStreamingSpeed {
        min_streaming_speed: u128,
        max_streaming_speed: u128,
        received: u128,
    },
    DataCorruption,
}
