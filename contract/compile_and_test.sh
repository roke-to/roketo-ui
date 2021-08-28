#!/bin/bash
set -e
cd "`dirname $0`"
RUSTFLAGS='-C link-arg=-s' cargo +nightly build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/xyiming.wasm ./res/
RUSTFLAGS='-C link-arg=-s' cargo +nightly test --all -- --nocapture
