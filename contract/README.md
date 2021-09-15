# Contract documentation

## Repository structure

All source code is located at `src` folder. Files `calls.rs` and `views.rs` are about interacting with the contract.
Other files contains of helpers and primitives.

### Build

Run `build.sh`. It will put the compiled contract into `res` folder named `xyiming.wasm`.

### Tests

Run `compile_and_test.sh`. It will build the contract followed by running simulation tests from `tests/general.rs`.

### Scripts 

Some useful scripts are located in `init` directory. They mostly related to automatic creation of several streams for testing purposes.

## Methods of the contract

### Calls

The contract supports the following calls:

- `create_stream` updates the accounts connected to the stream and creates a new stream.
The stream will be started automatically if deposit is non-zero. Returns new `stream_id`.
Can be called by anyone except the situation when `owner != predecessor` and auto-deposit is set to enabled.
This case is not allowed due to possibility of leaking funds from `owner`.
- `deposit` adds the amount of tokens to the stream.
- `update_account` push the time forward for the account. Returns vector of promises, one per token obtaining in streams.
Each promise transfers a specific kind of token to the account of the receiver directly.
Overall, execution of the method releases the tokens from being locked and sends them to the following streams
(for auto-deposit enabled streams) or/and to the account of the receiver.
In case of having not enough funds for covering auto-deposit payments, it will disable as many auto-deposit flags as needed
to process the payment. Technically, `update_account` can be used for withdrawing purposes.
- `start_stream` updates the accounts connected to the stream and starts or restarts initialized or paused stream.
Can be executed only by the owner or the receiver of the stream.
- `change_auto_deposit` updates the accounts connected to the stream and then updates the auto-deposit flag of the stream.
Be aware that lack of balance may cause disabling some auto-deposits while the accounts are updated.
Can be executed only by the owner of the stream.
- `pause_stream` updates the accounts connected to the stream and pauses the stream. Stream can be paused only if it was in the active state.
Can be executed only by the owner or the receiver of the stream.
- `stop_stream` updates the accounts connected to the stream and finished the stream. Finished streams cannot be restarted.
All remaining deposit sends back to the owner.
Can be executed only by the owner of the stream.
- `start_cron` creates a task for cron.cat for calling `update_account` automatically for the caller of the method. Returns promise to the task created.

### Views

The contract supports the following views:

- `get_account` returns the account requested.
- `get_stream` returns the data about the stream.
- `get_stream_history` returns the detailed history of the stream. Pagination for the history is supported on the contract level.

### Private calls

Calls related to fungible tokens processing are private.
These ones cannot be called directly and must be executed only by `ft_on_transfer` fungible token callback.

- `create_stream_ft` creates a new stream for a fungible token.
- `deposit_ft` works same way as `deposit` but for fungible tokens.

## API and integration

For integrating the contract to your project use the methods described above. Complete specification can be found below.

### Create a stream

```rust
pub fn create_stream(
    &mut self,
    description: Option<String>,
    owner_id: ValidAccountId,
    receiver_id: ValidAccountId,
    token_name: String,
    tokens_per_tick: WrappedBalance,
    auto_deposit_enabled: bool,
) -> Base58CryptoHash;
```
- `description` is an optional text description of the stream, max 255 symbols.
- `owner_id` is an owner of the stream. Usually the owner is the same as the sender.
- `receiver_id` is a receiver of the stream. Must not be the same as the owner.
- `token_name` must be a valid and whitelisted token name.
- `tokens_per_tick` is a speed of the stream in ticks.
- `auto_deposit_enabled` flag enables auto-deposit, if true.

### Deposit

```rust
pub fn deposit(&mut self, stream_id: Base58CryptoHash);
```
- `stream_id` is a valid stream id.

### Update an account

```rust
pub fn update_account(&mut self, account_id: ValidAccountId) -> Vec<Promise>;
```
- `account_id` is a valid account id.

### Start a stream

```rust
pub fn start_stream(&mut self, stream_id: Base58CryptoHash);
```
- `stream_id` is a valid stream id.

### Change the auto-deposit flag of a stream

```rust
pub fn change_auto_deposit(&mut self, stream_id: Base58CryptoHash, auto_deposit: bool);
```
- `stream_id` is a valid stream id.
- `auto_deposit` is a new value for the flag.

### Pause a stream

```rust
pub fn pause_stream(&mut self, stream_id: Base58CryptoHash);
```
- `stream_id` is a valid stream id.

### Stop a stream

```rust
pub fn stop_stream(&mut self, stream_id: Base58CryptoHash);
```
- `stream_id` is a valid stream id.

### Start a cron job

```rust
pub fn start_cron(&mut self) -> Promise;
```
Takes no args in the current version of the contract. Will be updated later.

## Stream states

Any stream may be in the one of the following states:
- `initialized`. Stream is created but not started yet. This state is reachable if create a stream with zero deposit.
- `active`. Stream is actively streaming tokens. Can be paused or stopped.
- `paused`. Stream is paused and not streaming any tokens. Can be restarted or stopped completely.
- `interrupted`. Stream is stopped by the owner. Cannot be restarted.
- `finished`. Stream is stopped by the receiver, manually or natually, by withdrawing all tokens from the stream. Cannot be restarted.

## How does it work

TODO