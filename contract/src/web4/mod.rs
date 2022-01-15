use crate::*;

#[allow(dead_code)]
#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Web4Request {
    #[serde(rename = "accountId")]
    account_id: Option<AccountId>,
    path: Option<String>,
    params: Option<HashMap<String, String>>,
    query: Option<HashMap<String, Vec<String>>>,
    preloads: Option<HashMap<String, Web4Response>>,
}

#[derive(Serialize, Deserialize, Default)]
#[serde(crate = "near_sdk::serde")]
pub struct Web4Response {
    #[serde(rename = "contentType")]
    content_type: Option<String>,
    status: Option<u32>,
    body: Option<Vec<u8>>,
    #[serde(rename = "bodyUrl")]
    body_url: Option<String>,
    #[serde(rename = "preloadUrls")]
    preload_urls: Option<Vec<String>>,
}

impl Web4Response {
    pub fn html(text: String) -> Self {
        Self {
            content_type: Some(String::from("text/html; charset=UTF-8")),
            body: Some(text.into_bytes()),
            ..Default::default()
        }
    }

    pub fn plain(text: String) -> Self {
        Self {
            content_type: Some(String::from("text/plain; charset=UTF-8")),
            body: Some(text.into_bytes()),
            ..Default::default()
        }
    }

    pub fn preload_urls(urls: Vec<String>) -> Self {
        Self {
            preload_urls: Some(urls),
            ..Default::default()
        }
    }

    pub fn body_url(url: String) -> Self {
        Self {
            body_url: Some(url),
            ..Default::default()
        }
    }

    pub fn status(status: u32) -> Self {
        Self {
            status: Some(status),
            ..Default::default()
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn web4_get(&self, request: Web4Request) -> Web4Response {
        let path = request.path.expect("Path expected");
        if path.starts_with("/static/") || path == "/favicon.png" || path == "/manifest.json" {
            return Web4Response::body_url(
                String::from("ipfs://bafybeigifbsj3nnbufxa3non7xas23r3yqjlfx3v3k27qgdgch2mmqdeue")
                    + &path,
            );
        }

        if path == "/robots.txt" {
            return Web4Response::plain("User-agent: *\nDisallow:".to_string());
        }

        if path == "/" {
            return Web4Response::html(include_str!("index.html").to_string());
        }
        if path == "/src" {
            return Web4Response::html(include_str!("src_list.html").to_string());
        }

        if path == "/interface/account_calls.rs" {
            return Web4Response::plain(include_str!("../interface/account_calls.rs").to_string());
        } else if path == "/interface/dao_calls.rs" {
            return Web4Response::plain(include_str!("../interface/dao_calls.rs").to_string());
        } else if path == "/interface/exchanger_calls.rs" {
            return Web4Response::plain(
                include_str!("../interface/exchanger_calls.rs").to_string(),
            );
        } else if path == "/interface/mod.rs" {
            return Web4Response::plain(include_str!("../interface/mod.rs").to_string());
        } else if path == "/interface/stream_calls.rs" {
            return Web4Response::plain(include_str!("../interface/stream_calls.rs").to_string());
        } else if path == "/interface/token_calls.rs" {
            return Web4Response::plain(include_str!("../interface/token_calls.rs").to_string());
        } else if path == "/interface/views.rs" {
            return Web4Response::plain(include_str!("../interface/views.rs").to_string());
        } else if path == "/web4/index.html" {
            return Web4Response::plain(include_str!("index.html").to_string());
        } else if path == "/web4/src_list.html" {
            return Web4Response::plain(include_str!("src_list.html").to_string());
        } else if path == "/web4/mod.rs" {
            return Web4Response::plain(include_str!("mod.rs").to_string());
        } else if path == "/account.rs" {
            return Web4Response::plain(include_str!("../account.rs").to_string());
        } else if path == "/aurora.rs" {
            return Web4Response::plain(include_str!("../aurora.rs").to_string());
        } else if path == "/dao.rs" {
            return Web4Response::plain(include_str!("../dao.rs").to_string());
        } else if path == "/err.rs" {
            return Web4Response::plain(include_str!("../err.rs").to_string());
        } else if path == "/lib.rs" {
            return Web4Response::plain(include_str!("../lib.rs").to_string());
        } else if path == "/primitives.rs" {
            return Web4Response::plain(include_str!("../primitives.rs").to_string());
        } else if path == "/stats.rs" {
            return Web4Response::plain(include_str!("../stats.rs").to_string());
        } else if path == "/stream.rs" {
            return Web4Response::plain(include_str!("../stream.rs").to_string());
        } else if path == "/stream_ops.rs" {
            return Web4Response::plain(include_str!("../stream_ops.rs").to_string());
        } else if path == "/token.rs" {
            return Web4Response::plain(include_str!("../token.rs").to_string());
        } else if path == "/API.md" {
            return Web4Response::plain(include_str!("../../API.md").to_string());
        } else if path == "/SHA.md" {
            return Web4Response::plain(include_str!("../../SHA.md").to_string());
        } else if path == "/Cargo.toml" {
            return Web4Response::plain(include_str!("../../Cargo.toml").to_string());
        }

        Web4Response::plain("Not found".to_string())
    }
}
