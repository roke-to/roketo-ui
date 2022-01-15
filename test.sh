#!/bin/bash
set -e
./build.sh
RUSTFLAGS='-C link-arg=-s' cargo test --all -- --nocapture
