use crate::*;

pub const ERR_DEPOSIT_NOT_ENOUGH: &str = "Attached deposit is not enough, expected";
pub const ERR_ACCESS_DENIED: &str = "Caller has no access, expected";
pub const ERR_STREAM_NOT_ACTIVE: &str = "Stream not exist or not active";

pub const CREATE_STREAM_DEPOSIT: Balance = 100_000_000_000_000_000_000_000; // 0.1 NEAR
pub const ONE_YOCTO: Balance = 1;
pub const ONE_NEAR: Balance = 1_000_000_000_000_000_000_000_000; // 1 NEAR

pub type StreamId = CryptoHash;
pub type StreamStatus = String;
pub type TokenId = u32;

pub const NUM_TOKENS: usize = 2;
pub const NEAR_TOKEN_ID: TokenId = 0;

pub const TOKENS: [&'static str; NUM_TOKENS] = ["NEAR", "DACHA"];

pub const TOKEN_ACCOUNTS: [&'static str; NUM_TOKENS] = ["", "dacha.tkn.near"];

pub const STREAM_ACTIVE: &'static str = "ACTIVE";
pub const STREAM_PAUSED: &'static str = "PAUSED";
pub const STREAM_FINISHED: &'static str = "FINISHED";

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
