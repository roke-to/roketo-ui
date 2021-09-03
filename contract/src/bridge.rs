use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Bridge {
    pub description: String,
    pub input_stream: StreamId,
    pub output_stream: StreamId,
    pub tokens_per_tick: Balance,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct BridgeView {
    pub bridge_id: Base58CryptoHash,
    pub description: String,
    pub input_stream: Base58CryptoHash,
    pub output_stream: Base58CryptoHash,
    pub tokens_per_tick: WrappedBalance,
}

impl From<&Bridge> for BridgeView {
    fn from(b: &Bridge) -> Self {
        Self {
            bridge_id: Base58CryptoHash::default(), // will be filled later
            description: b.description.clone(),
            input_stream: b.input_stream.into(),
            output_stream: b.output_stream.into(),
            tokens_per_tick: b.tokens_per_tick.into(),
        }
    }
}

impl Bridge {
    pub(crate) fn new(
        description: String,
        input_stream: StreamId,
        output_stream: StreamId,
        tokens_per_tick: Balance,
    ) -> BridgeId {
        let bridge_id = env::sha256(&env::block_index().to_be_bytes())
            .as_slice()
            .try_into()
            .unwrap();
        Xyiming::save_bridge_or_panic(
            &bridge_id,
            &Self {
                description,
                input_stream,
                output_stream,
                tokens_per_tick,
            },
        );
        bridge_id
    }
}

impl Xyiming {
    pub(crate) fn extract_bridge_or_panic(bridge_id: &BridgeId) -> Bridge {
        Self::bridges().remove(&bridge_id).unwrap()
    }

    pub(crate) fn save_bridge_or_panic(bridge_id: &BridgeId, bridge: &Bridge) {
        assert!(Self::bridges().insert(bridge_id, bridge).is_none());
    }
}
