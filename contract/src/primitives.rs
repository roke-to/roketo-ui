use crate::*;

pub const NO_DEPOSIT: Balance = 0;

pub const MAX_DESCRIPTION_LEN: usize = 255;

pub const MIN_STREAMING_SPEED: u128 = 1;
pub const MAX_STREAMING_SPEED: u128 = 1_000_000_000_000_000_000_000_000_000; // 1e27, TODO check limits

pub const TICKS_PER_SECOND: u128 = 1_000_000_000;
pub const ONE_TERA: u64 = Gas::ONE_TERA.0; // TODO near-sdk version is useless now

pub const DEFAULT_COMMISSION_UNLISTED: Balance = ONE_NEAR / 10; // 0.1 NEAR

// Explanation on default storage balance and gas needs.
//
// Normally it's enough to take 0.00125 NEAR for storage deposit
// and ~10 TGas for transfers and storage deposit
// for most regular fungible tokens based on NEP-141 standard.
// However, custom tokens may reqiure high amounts of NEAR
// for storage uses and needs more gas for complex calculations
// happens within transfers.
// To allow those custom tokens be transferable by the contract,
// the default limits were increased deliberately.
pub const DEFAULT_STORAGE_BALANCE: Balance = ONE_NEAR / 10;
pub const DEFAULT_GAS_FOR_FT_TRANSFER: Gas = Gas(50 * ONE_TERA);
pub const DEFAULT_GAS_FOR_STORAGE_DEPOSIT: Gas = Gas(25 * ONE_TERA);
// In cases to avoid high storage deposit and gas needs,
// or if the defaults are not enough for you token,
// ask DAO to whitelist the token with proper values.

pub const MIN_GAS_FOR_PROCESS_ACTION: Gas = Gas(100 * ONE_TERA);
pub const MIN_GAS_FOR_AURORA_TRANFSER: Gas = Gas(70 * ONE_TERA);

pub type StreamId = CryptoHash;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum StreamStatus {
    Initialized,
    Active,
    Paused,
    Finished { reason: StreamFinishReason },
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum StreamFinishReason {
    StoppedByOwner,
    StoppedByReceiver,
    FinishedNatually,
    FinishedBecauseCannotBeExtended,
}

impl StreamStatus {
    pub(crate) fn is_terminated(&self) -> bool {
        match self {
            StreamStatus::Initialized => false,
            StreamStatus::Active => false,
            StreamStatus::Paused => false,
            StreamStatus::Finished { reason: _ } => true,
        }
    }
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum ActionType {
    Init,
    Start,
    Pause,
    Withdraw { is_storage_deposit_needed: bool },
    Stop { reason: StreamFinishReason },
}

pub mod u128_dec_format {
    use near_sdk::serde::de;
    use near_sdk::serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(num: &u128, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&num.to_string())
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<u128, D::Error>
    where
        D: Deserializer<'de>,
    {
        String::deserialize(deserializer)?
            .parse()
            .map_err(de::Error::custom)
    }
}

pub mod u64_dec_format {
    use near_sdk::serde::de;
    use near_sdk::serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(num: &u64, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&num.to_string())
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<u64, D::Error>
    where
        D: Deserializer<'de>,
    {
        String::deserialize(deserializer)?
            .parse()
            .map_err(de::Error::custom)
    }
}

pub mod b58_dec_format {
    use near_sdk::json_types::Base58CryptoHash;
    use near_sdk::serde::{Deserialize, Deserializer, Serializer};
    use near_sdk::CryptoHash;

    pub fn serialize<S>(val: &CryptoHash, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // TODO please do it with no intermediate serialization if possible
        serializer.serialize_str(&String::from(&Base58CryptoHash::from(*val)))
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<CryptoHash, D::Error>
    where
        D: Deserializer<'de>,
    {
        // TODO same as above
        Ok(Base58CryptoHash::deserialize(deserializer)?.into())
    }
}
