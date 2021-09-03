use crate::*;

pub const ERR_DEPOSIT_NOT_ENOUGH: &str = "Attached deposit is not enough, expected";
pub const ERR_ACCESS_DENIED: &str = "Caller has no access, expected";
pub const ERR_STREAM_NOT_AVAILABLE: &str = "Stream not exist or terminated";
pub const ERR_WITHDRAW_PAUSED: &str = "Cannot withdraw from paused stream";
pub const ERR_PAUSE_PAUSED: &str = "Cannot pause paused stream";
pub const ERR_RESTART_ACTIVE: &str = "Cannot restart active stream";
pub const ERR_TEXT_FIELD_TOO_LONG: &str = "Text field is too long";

pub const CREATE_BRIDGE_DEPOSIT: Balance = 10_000_000_000_000_000_000_000; // 0.01 NEAR
pub const CREATE_STREAM_DEPOSIT: Balance = 100_000_000_000_000_000_000_000; // 0.1 NEAR
pub const ONE_YOCTO: Balance = 1;
pub const ONE_NEAR: Balance = 1_000_000_000_000_000_000_000_000; // 1 NEAR
pub const MAX_TEXT_FIELD: usize = 255;

pub type BridgeId = CryptoHash;
pub type StreamId = CryptoHash;
pub type TokenId = u32;

pub const NUM_TOKENS: usize = 2;
pub const NEAR_TOKEN_ID: TokenId = 0;

pub const TOKENS: [&'static str; NUM_TOKENS] = ["NEAR", "DACHA"];

pub const TOKEN_ACCOUNTS: [&'static str; NUM_TOKENS] = ["", "dacha.tkn.near"];

#[derive(BorshDeserialize, BorshSerialize, PartialEq)]
pub enum StreamStatus {
    Active,
    Paused,
    Interrupted,
    Finished,
}

impl StreamStatus {
    pub(crate) fn to_string(&self) -> String {
        match self {
            StreamStatus::Active => "ACTIVE".to_string(),
            StreamStatus::Paused => "PAUSED".to_string(),
            StreamStatus::Interrupted => "INTERRUPTED".to_string(),
            StreamStatus::Finished => "FINISHED".to_string(),
        }
    }

    pub(crate) fn is_terminated(&self) -> bool {
        match self {
            StreamStatus::Active => false,
            StreamStatus::Paused => false,
            StreamStatus::Interrupted => true,
            StreamStatus::Finished => true,
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize, PartialEq)]
pub struct Bridge {}

impl Xyiming {
    pub(crate) fn get_token_id_by_name(token_name: &String) -> Option<TokenId> {
        for x in 0..NUM_TOKENS {
            if TOKENS[x] == token_name {
                return Some(x as u32);
            }
        }
        None
    }

    pub(crate) fn get_token_name_by_id(token_id: TokenId) -> String {
        TOKENS[token_id as usize].to_string()
    }
}
