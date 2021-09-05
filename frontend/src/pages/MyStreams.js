import React, { useState } from 'react';
import { useNear } from '../features/near-connect/useNear';
import useSWR from 'swr';
import { fromNear, fromTaras } from '../components/Helpers';
import { StreamControls } from '../features/stream-control/StreamControls';
import { NEAR, loader, TARAS } from '../components/Helpers';

export function MyStreamsPage() {
  const near = useNear();
  const [token, setToken] = useState('NEAR');
  const [showButtons, setShowButtons] = useState(true);

  const { data: account } = useSWR(
    ['account', near.near.accountId],
    near.contractApi.getCurrentAccount,
    {
      errorRetryInterval: 250,
    },
  );

  const outputs = account && account.outputs ? account.outputs : [];

  const depositList = account
    ? outputs.map((output, id) => {
        return (
          <option key={id} value={id}>
            {output.stream_id}
          </option>
        );
      })
    : [];

  function selectClick(e) {
    var selectBox = document.getElementById('selectBox');
    if (selectBox.selectedIndex > 0) {
      setToken(outputs[selectBox.selectedIndex - 1].token_name);
    }
  }
  async function depositClick(e) {
    e.preventDefault();
    setShowButtons(false);
    var selectBox = document.getElementById('selectBox');
    if (selectBox.selectedIndex > 0) {
      const stream = outputs[selectBox.selectedIndex - 1];
      if (token === 'NEAR') {
        const deposit =
          String(
            parseInt(
              parseFloat(document.getElementById('depositTokensInput').value) *
                1e9,
            ),
          ) + '000000000000000';
        const res = await near.near.contract.deposit(
          { stream_id: stream.stream_id },
          '200000000000000',
          deposit,
        );
        console.log('deposit NEAR res', res);
      } else {
        const deposit =
          String(
            parseInt(
              parseFloat(document.getElementById('depositTokensInput').value) *
                1e9,
            ),
          ) + '000000000'; // get decimals per each ft contract
        const res = await near.near.ft.ft_transfer_call(
          {
            receiver_id: near.near.near.config.contractName,
            amount: deposit,
            memo: 'xyiming transfer',
            msg: stream.stream_id,
          },
          '200000000000000',
          1,
        );
        console.log('deposit TARAS res', res);
      }
    }
    setShowButtons(true);
  }

  const outputsTable = outputs.map((output, id) => {
    return (
      <div
        className="card"
        style={{ width: '90%', margin: '15px', backgroundColor: '#141414' }}
        key={id}
      >
        <div className="card-body">
          <div className="d-flex flex-row justify-content-between w-100">
            <div className="col-2 m-1">{output.receiver_id}</div>
            <small className="col-1 m-1">
              <small>
                <samp className="text-secondary">
                  {output.stream_id.substr(0, 6)}...
                </samp>
              </small>
            </small>
            <small className="col-1 m-1">
              {output.token_name === 'NEAR'
                ? fromNear(output.balance).toFixed(2)
                : fromTaras(output.balance).toFixed(2)}
            </small>
            <small className="col-1 m-1">{output.token_name}</small>
            <small className="col-1 m-1">
              {output.token_name === 'NEAR'
                ? (fromNear(output.tokens_per_tick) * 1e9).toFixed(2)
                : (fromTaras(output.tokens_per_tick) * 1e9).toFixed(2)}{' '}
              {output.token_name}/s
            </small>
            <small className="col-1 m-1">
              {output.token_name === 'NEAR'
                ? fromNear(output.tokens_available).toFixed(2)
                : fromTaras(output.tokens_available).toFixed(2)}
            </small>
            <small className="col-1 m-1">
              {output.token_name === 'NEAR'
                ? fromNear(output.tokens_transferred).toFixed(2)
                : fromTaras(output.tokens_transferred).toFixed(2)}
            </small>
            <small className="col-1 m-1">{output.status}</small>
            <div className="col-2 m-1">
              <StreamControls output={output} />
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="twind-container">
      <div>
        <h4>Streams owned by you</h4>
        <div
          className="card"
          style={{ width: '90%', margin: '15px', backgroundColor: '#181818' }}
        >
          <div className="card-body">
            <div className="d-flex flex-row justify-content-between w-100">
              <div className="col-2 m-1">Receiver</div>
              <div className="col-1 m-1">Stream ID</div>
              <div className="col-1 m-1">Tokens left</div>
              <div className="col-1 m-1">Token name</div>
              <div className="col-1 m-1">Stream speed</div>
              <div className="col-1 m-1">Tokens unlocked</div>
              <div className="col-1 m-1">Tokens transferred</div>
              <div className="col-1 m-1">Stream status</div>
              <div className="col-2 m-1" />
            </div>
          </div>
        </div>
        {outputsTable}
      </div>

      <div
        className="card"
        style={{ width: '90%', margin: '15px', backgroundColor: '#141414' }}
      >
        <div className="card-body">
          <h5 className="card-title">Deposit tokens</h5>
          <h6 className="card-subtitle mb-3 text-muted">
            Extend your existing stream
          </h6>
          <form onSubmit={(e) => depositClick(e)}>
            <div className="form-group mb-2">
              <label htmlFor="ownerInput" className="mb-2">
                Stream
              </label>
              <select
                id="selectBox"
                className="form-control custom-select"
                onChange={(e) => selectClick(e)}
              >
                <option selected>Open this select menu</option>
                {depositList}
              </select>
            </div>
            <label htmlFor="depositTokensInput" className="mb-2">
              Amount of tokens to deposit
            </label>
            <div className="input-group mb-2">
              <div className="input-group-prepend">
                <span
                  className="input-group-text"
                  id="basic-addon2"
                  style={{
                    backgroundColor: '#303030',
                    color: '#e0e0e0',
                    fontSize: '150%',
                  }}
                >
                  {token === 'NEAR' ? NEAR : TARAS}
                </span>
              </div>
              <input
                className="form-control"
                id="depositTokensInput"
                placeholder="0.03"
                describedby="basic-addon2"
                style={{ backgroundColor: '#101010', color: '#e0e0e0' }}
              />
            </div>

            {near.inited && showButtons ? (
              <button
                disabled={!near.auth.signedIn}
                className="btn btn-primary mt-4"
              >
                Deposit
              </button>
            ) : (
              <div className="mt-4">{loader()}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
