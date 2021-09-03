use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Bridge {
    pub description: String,
    pub input_stream_id: StreamId,
    pub output_stream_id: StreamId,
    pub redirect_rate: u32,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct BridgeView {
    pub bridge_id: Base58CryptoHash,
    pub description: String,
    pub input_stream_id: Base58CryptoHash,
    pub output_stream_id: Base58CryptoHash,
    pub redirect_rate: f64,
}

impl From<&Bridge> for BridgeView {
    fn from(b: &Bridge) -> Self {
        Self {
            bridge_id: Base58CryptoHash::default(), // will be filled later
            description: b.description.clone(),
            input_stream_id: b.input_stream_id.into(),
            output_stream_id: b.output_stream_id.into(),
            redirect_rate: f64::from(b.redirect_rate) * 1e-9,
        }
    }
}

impl Bridge {
    pub(crate) fn new(
        description: String,
        input_stream_id: StreamId,
        output_stream_id: StreamId,
        redirect_rate: u32,
    ) -> BridgeId {
        let bridge_id = env::sha256(&env::block_index().to_be_bytes())
            .as_slice()
            .try_into()
            .unwrap();
        Xyiming::save_bridge_or_panic(
            &bridge_id,
            &Self {
                description,
                input_stream_id,
                output_stream_id,
                redirect_rate,
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
