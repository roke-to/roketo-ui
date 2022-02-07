# Contract documentation (outdated)

## Repository structure

All source code is located at `src` folder. Files `calls.rs` and `views.rs` are about interacting with the contract.
Other files contains of helpers and primitives.

### Build

Run `build.sh`. It will put the compiled contract into `res` folder named `roketo.wasm`.

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

### Get account view

```rust
pub fn get_account(&self, account_id: ValidAccountId) -> Option<AccountView>;
```
- `account_id` is a valid account id. Returns `None` if the account does not exist.

### Get stream view

```rust
pub fn get_stream(&self, stream_id: Base58CryptoHash) -> Option<StreamView>;
```
- `stream_id` is a valid stream id. Returns `None` if the stream does not exist

### Get stream history

```rust
pub fn get_stream_history(
    &self,
    stream_id: Base58CryptoHash,
    from: u64,
    to: u64,
) -> Vec<ActionView>;
```
- `stream_id` is a valid stream id.
- `from` and `to` represents the range, `history[from..to]` will be returned.

## View structs

### AccountView

```rust
pub struct AccountView {
    pub account_id: String,
    pub inputs: Vec<Base58CryptoHash>,
    pub outputs: Vec<Base58CryptoHash>,
    pub last_action: WrappedTimestamp,
    pub total_received: Vec<(String, WrappedBalance)>,
    pub total_incoming: Vec<(String, WrappedBalance)>,
    pub total_outgoing: Vec<(String, WrappedBalance)>,
    pub cron_calls_enabled: bool,
}
```
- `account_id` of the requested account.
- `inputs` is a vector of hashes corresponds to the incoming streams.
- `outputs` is a vector of hashes corresponds to the outgoing streams.
- `last_action` is a timestamp of the last update called for the account.
- `total_received` is a vector of pairs represents tokens received name and amount since account creation.
- `total_incoming` is a vector of pairs represents tokens incoming name and amount per tick.
- `total_outgoing` is a vector of pairs represents tokens outgoing name and amount per tick.
- `cron_calls_enabled` is a flag to allow or disallow cron jobs creation. Currently unused.

### StreamView

```rust
pub struct StreamView {
    pub stream_id: Option<Base58CryptoHash>,
    pub description: Option<String>,
    pub owner_id: String,
    pub receiver_id: String,
    pub token_name: String,
    pub timestamp_created: WrappedTimestamp,
    pub balance: WrappedBalance,
    pub tokens_per_tick: WrappedBalance,
    pub auto_deposit_enabled: bool,
    pub status: String,
    pub tokens_total_withdrawn: WrappedBalance,
    pub available_to_withdraw: WrappedBalance,
    pub history_len: u64,
}
```
- `stream_id` of the requested stream.
- `description` is a description text field.
- `owner_id`.
- `receiver_id`.
- `token_name` is a valid and whitelisted token name.
- `timestamp_created` is a timestamp when the stream has been created.
- `auto_deposit_enabled` flag for auto-deposit bool value.
- `status` is the status of the stream, see below.
- `tokens_total_withdrawn` is the amount of how many tokens has been withdrawn from the stream for all the period of its activity.
- `available_to_withdraw` is the amount of how many tokens can be withdrawn by receiver if `update_account` is called.
- `history_len` is a number of records in the stream history. See details below.

### ActionView

```rust
pub struct ActionView {
    pub actor: String,
    pub action_type: String,
    pub amount: Option<WrappedBalance>,
    pub timestamp: WrappedTimestamp,
}
```
- `actor` is the executor of the action.
- `action_type` is a type of the action, see Stream History below.
- `amount` of tokens, is applicable.
- `timestamp` of the action.

## Stream states

Any stream may be in the one of the following states:
- `initialized`. Stream is created but not started yet. This state is reachable if create a stream with zero deposit.
- `active`. Stream is actively streaming tokens. Can be paused or stopped.
- `paused`. Stream is paused and not streaming any tokens. Can be restarted or stopped completely.
- `interrupted`. Stream is stopped by the owner. Cannot be restarted.
- `finished`. Stream is stopped by the receiver, manually or natually, by withdrawing all tokens from the stream. Cannot be restarted.

## Stream history

Stream history is the complete list of operations happened with any stream.
Getting stream history is possible with view method `get_stream_history`, see above.

### Actions

- `init`. Create a stream.
- `Deposit`. Amount of tokens received to deposit.
- `Withdraw`. Amount of tokens withdrawn.
- `Refund`. Amount of tokens returned to the owner in case of stopping the stream.
- `Start`. Start the stream.
- `Pause`. Pause the stream.
- `Stop`. Stop the stream.
- `EnableAutoDeposit`. Enable auto-deposit.
- `DisableAutoDeposit`. Disable auto-deposit.

Several actions may be applied in one transaction due to following the invariant of keeping the valid state of the accounts.
