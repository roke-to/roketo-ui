import React, { useState } from 'react'
import useSWR from 'swr'

import { fromNear } from '../components/Helpers'
import { useNear } from '../features/near-connect/useNear'

function ReceivingStremsTable ({
  inputs,
  signedIn,
  connected,
  showButtons,
  onWithdraw,
  onPause,
  onStop
}) {
  return (
    <table>
      <thead>
        <th className=''>From owner</th>
        <th className=''>Stream ID</th>
        <th className=''>Tokens left</th>
        <th className=''>Token name</th>
        <th className=''>Stream speed</th>
        <th className=''>Tokens unlocked</th>
        <th className=''>Tokens transferred</th>
        <th className=''>Stream status</th>
        <th className='' />
      </thead>
      <tbody>
        {inputs.map((input, id) => (
          <tr>
            <td className=''>{input.owner_id}</td>
            <td className='col-1 m-1'>
              <small>
                <samp className='text-secondary'>
                  {input.stream_id.substr(0, 6)}...
                </samp>
              </small>
            </td>
            <td className='col-1 m-1'>{fromNear(input.balance).toFixed(2)}</td>
            <td className='col-1 m-1'>{input.token_name}</td>
            <td className='col-1 m-1'>
              {(fromNear(input.tokens_per_tick) * 1e9).toFixed(2)}{' '}
              {input.token_name}/s
            </td>
            <td className='col-1 m-1'>
              {fromNear(input.available_to_withdraw).toFixed(2)}
            </td>
            <td className='col-1 m-1'>
              {fromNear(input.tokens_transferred).toFixed(2)}
            </td>
            <td className='col-1 m-1'>{input.status}</td>
            <td className='col-2 m-1'>
              {connected && showButtons && input.status === 'ACTIVE' ? (
                <div className='d-flex flex-row'>
                  <button
                    disabled={!signedIn}
                    className='btn btn-success btn-sm m-1'
                    onClick={(e) => onWithdraw(e, input)}
                  >
                    Withdraw
                  </button>
                  <button
                    disabled={!signedIn}
                    className='btn btn-warning btn-sm m-1'
                    onClick={(e) => onPause(e, input)}
                  >
                    Pause
                  </button>
                  <button
                    disabled={!signedIn}
                    className='btn btn-danger btn-sm m-1'
                    onClick={(e) => onStop(e, input)}
                  >
                    Stop
                  </button>
                </div>
              ) : (
                <div />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const mockInputs = [
  {
    owner_id: 'йцуйцQWEQWE',
    stream_id: 'QWEQWE',
    balance: 'QWEQWE',
    token_name: 'NAR',
    tokens_per_tick: 'QWEQWE',
    tokens_available: 'QWEQWE',
    tokens_transferred: 'QWEQWE',
    status: 'QWEQWE'
  },
  {
    owner_id: 'йцуйцQWEQWE',
    stream_id: 'QWEQWE',
    balance: 'QWEQWwqeqweqweqweqweqweE',
    token_name: 'NIR',
    tokens_per_tick: 'QWEQWE',
    tokens_available: 'QWEQWE',
    tokens_transferred: 'QWEQWE',
    status: 'ACTIVE'
  },
  {
    owner_id: 'йцуйцQWEQWE',
    stream_id: 'QWEQWEqwewe',
    balance: 'QWEQWEqweqw',
    token_name: 'NEAR',
    tokens_per_tick: 'QWEQWEqwe',
    tokens_available: 'QWEQWEqwe',
    tokens_transferred: 'QWEQWqweE',
    status: 'ACTIVE'
  }
]

function ReceivePage () {
  const near = useNear()

  const signedIn = near.auth.signedIn
  const profileId = near.near.accountId

  const [showButtons, setShowButtons] = useState(true)

  async function pauseStreamClick (e, output) {
    e.preventDefault()
    setShowButtons(false)
    console.log('pausing', output)
    const res = await near.near.contract.pause_stream(
      { stream_id: output.stream_id },
      '200000000000000',
      1
    )
    console.log('pausing res', res)
  }

  async function withdrawStreamClick (e, input) {
    e.preventDefault()
    setShowButtons(false)
    console.log('withdraw', input)
    const res = await near.near.contract.update_account(
      { account_id: profileId },
      '200000000000000',
      0
    )
    console.log('withdraw res', res)
    // TODO update the page instantly
    setShowButtons(true)
  }

  async function stopStreamClick (e, input) {
    e.preventDefault()
    setShowButtons(false)
    console.log('stopping', input)
    const res = await near.near.contract.stop_stream(
      { stream_id: input.stream_id },
      '200000000000000',
      1
    )
    console.log('stopping res', res)
  }

  const fetchAccount = async (...args) => {
    try {
      if (!profileId) {
        return []
      }
      return await near.near.contract.get_account({ account_id: profileId })
    } catch (e) {
      console.log('near error', e)
    }
    return []
  }

  const { data: account } = useSWR(['account', profileId], fetchAccount, {
    errorRetryInterval: 250
  })
  let inputs = account && account.inputs ? account.inputs : []
  console.log('inputs', inputs)

  if (near.inited && account) {
    inputs = inputs.map((input, id) => {
      return (
        <div
          className='card'
          style={{ width: '90%', margin: '15px', backgroundColor: '#141414' }}
          key={id}
        >
          <div className='card-body'>
            <div className='d-flex flex-row justify-content-between w-100'>
              <div className='col-2 m-1'>{input.owner_id}</div>
              <small className='col-1 m-1'>
                <small>
                  <samp className='text-secondary'>
                    {input.stream_id.substr(0, 6)}...
                  </samp>
                </small>
              </small>
              <small className='col-1 m-1'>
                {fromNear(input.balance).toFixed(2)}
              </small>
              <small className='col-1 m-1'>{input.token_name}</small>
              <small className='col-1 m-1'>
                {(fromNear(input.tokens_per_tick) * 1e9).toFixed(2)}{' '}
                {input.token_name}/s
              </small>
              <small className='col-1 m-1'>
                {fromNear(input.available_to_withdraw).toFixed(2)}
              </small>
              <small className='col-1 m-1'>
                {fromNear(input.tokens_transferred).toFixed(2)}
              </small>
              <small className='col-1 m-1'>{input.status}</small>
              <div className='col-2 m-1'>
                {near.inited && showButtons && input.status === 'ACTIVE' ? (
                  <div className='d-flex flex-row'>
                    <button
                      disabled={!signedIn}
                      className='btn btn-success btn-sm m-1'
                      onClick={(e) => withdrawStreamClick(e, input)}
                    >
                      Withdraw
                    </button>
                    <button
                      disabled={!signedIn}
                      className='btn btn-warning btn-sm m-1'
                      onClick={(e) => pauseStreamClick(e, input)}
                    >
                      Pause
                    </button>
                    <button
                      disabled={!signedIn}
                      className='btn btn-danger btn-sm m-1'
                      onClick={(e) => stopStreamClick(e, input)}
                    >
                      Stop
                    </button>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        </div>
      )
    })
  }

  return !near.inited ? (
    <div className='container g-0 px-5'>
      Please connect your NEAR Account first
    </div>
  ) : (
    <div className='twcontainer g-0 px-5'>
      <h4 className='twtext-2xl twmb-6'>Your receiving streams</h4>
      <div className='card tww-full twbg-gray-700'>
        <div className='card-body'>
          <div className='d-flex flex-row justify-content-between w-100'>
            <div className='col-2 m-1'>From owner</div>
            <div className='col-1 m-1'>Stream ID</div>
            <div className='col-1 m-1'>Tokens left</div>
            <div className='col-1 m-1'>Token name</div>
            <div className='col-1 m-1'>Stream speed</div>
            <div className='col-1 m-1'>Tokens unlocked</div>
            <div className='col-1 m-1'>Tokens transferred</div>
            <div className='col-1 m-1'>Stream status</div>
            <div className='col-2 m-1' />
          </div>
        </div>
      </div>
      {inputs}
    </div>
  )
}

export default ReceivePage
